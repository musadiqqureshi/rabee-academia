"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

async function requireStudent() {
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");
  return profile;
}

async function upsertSubmission(
  assignmentId: string,
  studentId: string,
  values: Record<string, unknown>,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("assignment_submissions")
    .upsert(
      { assignment_id: assignmentId, student_id: studentId, ...values },
      { onConflict: "assignment_id,student_id" },
    );
  if (error) throw new Error(error.message);
}

export async function saveDraft(formData: FormData) {
  const profile = await requireStudent();
  const assignmentId = String(formData.get("assignment_id") ?? "");
  await upsertSubmission(assignmentId, profile.id, {
    content: String(formData.get("content") ?? "") || null,
    drive_url: String(formData.get("drive_url") ?? "").trim() || null,
    status: "draft",
  });
  revalidatePath(`/dashboard/student/assignments/${assignmentId}`);
}

export async function submitWork(formData: FormData) {
  const profile = await requireStudent();
  const assignmentId = String(formData.get("assignment_id") ?? "");
  await upsertSubmission(assignmentId, profile.id, {
    content: String(formData.get("content") ?? "") || null,
    drive_url: String(formData.get("drive_url") ?? "").trim() || null,
    status: "submitted",
    submitted_at: new Date().toISOString(),
  });
  revalidatePath(`/dashboard/student/assignments/${assignmentId}`);
}
