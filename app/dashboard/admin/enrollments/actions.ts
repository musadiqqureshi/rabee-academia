"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { notifyUser } from "@/lib/notify";

async function requireStaff() {
  const profile = await getProfile();
  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    throw new Error("Not authorized");
  }
  return profile;
}

// Find a teacher assigned to this subject and a batch for them (auto-creating
// one if needed) so the student is allotted WITHOUT anyone manually making a
// batch. Returns { teacherId, batchId } or nulls if no teacher is assigned.
async function autoAllot(
  supabase: Awaited<ReturnType<typeof createClient>>,
  subjectId: string,
  classType: string,
): Promise<{ teacherId: string | null; batchId: string | null }> {
  if (!subjectId) return { teacherId: null, batchId: null };

  // Teachers assigned to this subject.
  const { data: ts } = await supabase
    .from("teacher_subjects").select("teacher_id").eq("subject_id", subjectId);
  const teacherIds = (ts ?? []).map((t) => t.teacher_id);
  if (teacherIds.length === 0) return { teacherId: null, batchId: null };

  // Pick the least-loaded teacher (fewest active enrolments).
  const { data: loads } = await supabase
    .from("enrollments").select("teacher_id").in("teacher_id", teacherIds).eq("status", "approved");
  const count = new Map<string, number>();
  teacherIds.forEach((t) => count.set(t, 0));
  for (const l of loads ?? []) if (l.teacher_id) count.set(l.teacher_id, (count.get(l.teacher_id) ?? 0) + 1);
  const teacherId = [...count.entries()].sort((a, b) => a[1] - b[1])[0][0];

  // Find or create an active batch for this subject + teacher + class type.
  const { data: existing } = await supabase
    .from("batches").select("id")
    .eq("subject_id", subjectId).eq("teacher_id", teacherId).eq("class_type", classType)
    .eq("is_active", true).maybeSingle();
  if (existing) return { teacherId, batchId: existing.id };

  const { data: created } = await supabase
    .from("batches")
    .insert({ subject_id: subjectId, teacher_id: teacherId, class_type: classType, is_active: true })
    .select("id").maybeSingle();
  return { teacherId, batchId: created?.id ?? null };
}

export async function approveEnrollment(formData: FormData) {
  const profile = await requireStaff();
  const supabase = await createClient();
  const id = String(formData.get("enrollment_id") ?? "");
  const batchId = String(formData.get("batch_id") ?? "");

  // Load the enrolment to know subject + class type for auto-allotment.
  const { data: enr } = await supabase
    .from("enrollments")
    .select("student_id, subject_id, class_type, subjects:subject_id ( name )")
    .eq("id", id)
    .maybeSingle();

  const update: Record<string, unknown> = {
    status: "approved",
    approved_by: profile.id,
    approved_at: new Date().toISOString(),
  };

  // Manual batch wins; otherwise auto-allot to an available teacher.
  if (batchId) {
    update.batch_id = batchId;
    const { data: b } = await supabase.from("batches").select("teacher_id").eq("id", batchId).maybeSingle();
    if (b?.teacher_id) update.teacher_id = b.teacher_id;
  } else if (enr?.subject_id) {
    const { teacherId, batchId: autoBatch } = await autoAllot(
      supabase, enr.subject_id, enr.class_type ?? "regular",
    );
    if (teacherId) update.teacher_id = teacherId;
    if (autoBatch) update.batch_id = autoBatch;
  }

  await supabase.from("enrollments").update(update).eq("id", id);

  // Notify the student (in-app + email).
  if (enr?.student_id) {
    const subjectName = (enr.subjects as unknown as { name: string } | null)?.name ?? "your course";
    await notifyUser(
      supabase as never,
      enr.student_id,
      "Enrollment approved 🎉",
      `Your enrollment for ${subjectName} has been approved. You can now access your classes in the portal.`,
    );
  }

  // Confirm the linked payment + invoice.
  await supabase
    .from("payments")
    .update({ status: "paid", verified_by: profile.id, verified_at: new Date().toISOString(), paid_at: new Date().toISOString() })
    .eq("enrollment_id", id);
  await supabase
    .from("invoices")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("enrollment_id", id);

  revalidatePath("/dashboard/admin/enrollments");
  revalidatePath("/dashboard/admin/students");
  revalidatePath("/dashboard/student/subjects");
}

export async function rejectEnrollment(formData: FormData) {
  await requireStaff();
  const supabase = await createClient();
  const id = String(formData.get("enrollment_id") ?? "");

  await supabase.from("enrollments").update({ status: "rejected" }).eq("id", id);
  await supabase.from("payments").update({ status: "refunded" }).eq("enrollment_id", id);

  revalidatePath("/dashboard/admin/enrollments");
  revalidatePath("/dashboard/admin/students");
  revalidatePath("/dashboard/student/subjects");
}
