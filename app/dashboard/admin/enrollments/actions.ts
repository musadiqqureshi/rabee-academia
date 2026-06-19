"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

async function requireStaff() {
  const profile = await getProfile();
  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    throw new Error("Not authorized");
  }
  return profile;
}

export async function approveEnrollment(formData: FormData) {
  const profile = await requireStaff();
  const supabase = await createClient();
  const id = String(formData.get("enrollment_id") ?? "");
  const batchId = String(formData.get("batch_id") ?? "");

  // Assigning a batch links the student to a teacher + schedule, so the
  // enrolment shows up in the student's "My Subjects" and the teacher's
  // "My Students". Approval without a batch is still allowed but unassigned.
  const update: Record<string, unknown> = {
    status: "approved",
    approved_by: profile.id,
    approved_at: new Date().toISOString(),
  };
  if (batchId) update.batch_id = batchId;

  await supabase.from("enrollments").update(update).eq("id", id);

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
}

export async function rejectEnrollment(formData: FormData) {
  await requireStaff();
  const supabase = await createClient();
  const id = String(formData.get("enrollment_id") ?? "");

  await supabase.from("enrollments").update({ status: "rejected" }).eq("id", id);
  await supabase.from("payments").update({ status: "refunded" }).eq("enrollment_id", id);

  revalidatePath("/dashboard/admin/enrollments");
}
