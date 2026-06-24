"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { notifyMany } from "@/lib/notify";

// Marks a whole batch (course) as completed: every approved student is marked
// complete, their certificate becomes available, and they're notified.
export async function markBatchComplete(formData: FormData) {
  const profile = await getProfile();
  if (!profile || !["admin", "super_admin"].includes(profile.role)) throw new Error("Not authorized");
  const supabase = await createClient();

  const batchId = String(formData.get("batch_id") ?? "");
  if (!batchId) throw new Error("Batch required");

  const { data: enrolled } = await supabase
    .from("enrollments")
    .select("student_id")
    .eq("batch_id", batchId)
    .eq("status", "approved")
    .eq("completed", false);

  await supabase
    .from("enrollments")
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq("batch_id", batchId)
    .eq("status", "approved");

  const studentIds = [...new Set((enrolled ?? []).map((e) => e.student_id as string))];
  if (studentIds.length > 0) {
    await notifyMany(
      studentIds,
      "Course completed 🎓",
      "Congratulations! Your course has been marked complete. Your certificate is now available in your portal under Certificates.",
    );
  }

  revalidatePath("/dashboard/admin/batches");
  revalidatePath("/dashboard/admin/completions");
  revalidatePath("/dashboard/student/subjects");
  revalidatePath("/dashboard/student/certificates");
}

async function requireStaff() {
  const profile = await getProfile();
  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    throw new Error("Not authorized");
  }
  return profile;
}

export async function createBatch(formData: FormData) {
  await requireStaff();
  const supabase = await createClient();

  const subjectId = String(formData.get("subject_id") ?? "");
  const teacherId = String(formData.get("teacher_id") ?? "");
  if (!subjectId || !teacherId) throw new Error("Subject and teacher are required");

  const startDate = String(formData.get("start_date") ?? "");
  const endDate = String(formData.get("end_date") ?? "");
  const maxStudents = Number(formData.get("max_students") ?? 0);

  const { error } = await supabase.from("batches").insert({
    subject_id: subjectId,
    teacher_id: teacherId,
    class_type: String(formData.get("class_type") ?? "regular"),
    meet_link: String(formData.get("meet_link") ?? "").trim() || null,
    start_date: startDate || null,
    end_date: endDate || null,
    max_students: maxStudents > 0 ? maxStudents : null,
    is_active: true,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/admin/batches");
}
