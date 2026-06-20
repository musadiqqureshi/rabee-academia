"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

// Set the Google Meet link for a batch. Teachers may edit their own batches;
// admins may edit any (RLS enforces this on the update).
export async function setBatchMeetLink(formData: FormData) {
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");
  const supabase = await createClient();

  const batchId = String(formData.get("batch_id") ?? "");
  const link = String(formData.get("meet_link") ?? "").trim() || null;
  if (!batchId) throw new Error("Batch required");

  const { error } = await supabase.from("batches").update({ meet_link: link }).eq("id", batchId);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/teacher/classes");
  revalidatePath("/dashboard/admin/classes");
  revalidatePath("/dashboard/student/classes");
  revalidatePath("/dashboard/student/subjects");
}

// Set the personal 1:1 class link for a single student's enrolment.
export async function setEnrollmentMeetLink(formData: FormData) {
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");
  const supabase = await createClient();

  const enrollmentId = String(formData.get("enrollment_id") ?? "");
  const link = String(formData.get("meet_link") ?? "").trim() || null;
  if (!enrollmentId) throw new Error("Enrollment required");

  const { error } = await supabase.from("enrollments").update({ meet_link: link }).eq("id", enrollmentId);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/teacher/classes");
  revalidatePath("/dashboard/admin/classes");
  revalidatePath("/dashboard/student/classes");
  revalidatePath("/dashboard/student/subjects");
}
