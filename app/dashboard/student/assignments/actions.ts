"use server";

import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

async function requireStudent() {
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");
  return profile;
}

function svc() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createAdminClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// Upload the (optional) submission image to the private bucket via service role.
// Returns the stored path, or undefined if no valid image was provided.
async function uploadImage(assignmentId: string, studentId: string, formData: FormData): Promise<string | undefined> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return undefined;
  if (!file.type.startsWith("image/")) throw new Error("Please upload an image file.");
  if (file.size > 8 * 1024 * 1024) throw new Error("Image must be under 8 MB.");
  const admin = svc();
  if (!admin) throw new Error("File uploads aren't configured.");
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const path = `${studentId}/${assignmentId}.${ext}`;
  const { error } = await admin.storage.from("assignment-files").upload(path, file, { upsert: true, contentType: file.type || undefined });
  if (error) throw new Error("Image upload failed. Please try again.");
  return path;
}

async function upsertSubmission(assignmentId: string, studentId: string, values: Record<string, unknown>) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("assignment_submissions")
    .upsert({ assignment_id: assignmentId, student_id: studentId, ...values }, { onConflict: "assignment_id,student_id" });
  if (error) throw new Error(error.message);
}

export async function saveDraft(formData: FormData) {
  const profile = await requireStudent();
  const assignmentId = String(formData.get("assignment_id") ?? "");
  const fileUrl = await uploadImage(assignmentId, profile.id, formData);
  await upsertSubmission(assignmentId, profile.id, {
    content: String(formData.get("content") ?? "") || null,
    drive_url: String(formData.get("drive_url") ?? "").trim() || null,
    ...(fileUrl ? { file_url: fileUrl } : {}),
    status: "draft",
  });
  revalidatePath(`/dashboard/student/assignments/${assignmentId}`);
}

export async function submitWork(formData: FormData) {
  const profile = await requireStudent();
  const assignmentId = String(formData.get("assignment_id") ?? "");
  const fileUrl = await uploadImage(assignmentId, profile.id, formData);
  await upsertSubmission(assignmentId, profile.id, {
    content: String(formData.get("content") ?? "") || null,
    drive_url: String(formData.get("drive_url") ?? "").trim() || null,
    ...(fileUrl ? { file_url: fileUrl } : {}),
    status: "submitted",
    submitted_at: new Date().toISOString(),
  });
  revalidatePath(`/dashboard/student/assignments/${assignmentId}`);
}
