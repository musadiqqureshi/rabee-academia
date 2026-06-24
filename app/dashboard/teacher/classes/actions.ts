"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { notifyMany } from "@/lib/notify";

const LINK_TITLE = "Your class link is ready 🎥";
const LINK_BODY = "Your teacher added a class link. Open your portal to join the class.";

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

  // Notify every approved student in this batch that their class link is up.
  if (link) {
    const { data: students } = await supabase
      .from("enrollments").select("student_id").eq("batch_id", batchId).eq("status", "approved");
    await notifyMany((students ?? []).map((s) => s.student_id as string), LINK_TITLE, LINK_BODY);
  }

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

  // Notify the student that their personal class link is ready.
  if (link) {
    const { data: enr } = await supabase
      .from("enrollments").select("student_id").eq("id", enrollmentId).maybeSingle();
    if (enr?.student_id) await notifyMany([enr.student_id as string], LINK_TITLE, LINK_BODY);
  }

  revalidatePath("/dashboard/teacher/classes");
  revalidatePath("/dashboard/admin/classes");
  revalidatePath("/dashboard/student/classes");
  revalidatePath("/dashboard/student/subjects");
}

// Add an extra class link to a student's enrolment (unlimited per class).
export async function addClassLink(formData: FormData) {
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");
  const supabase = await createClient();

  const enrollmentId = String(formData.get("enrollment_id") ?? "") || null;
  const batchId = String(formData.get("batch_id") ?? "") || null;
  const url = String(formData.get("url") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim() || null;
  if (!url) throw new Error("A link URL is required");
  if (!enrollmentId && !batchId) throw new Error("Class is required");

  const { error } = await supabase.from("class_links").insert({
    enrollment_id: enrollmentId,
    batch_id: batchId,
    teacher_id: profile.id,
    label,
    url,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/teacher/classes");
  revalidatePath("/dashboard/student/classes");
}

export async function deleteClassLink(formData: FormData) {
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");
  const supabase = await createClient();
  const id = String(formData.get("link_id") ?? "");
  await supabase.from("class_links").delete().eq("id", id).eq("teacher_id", profile.id);
  revalidatePath("/dashboard/teacher/classes");
  revalidatePath("/dashboard/student/classes");
}
