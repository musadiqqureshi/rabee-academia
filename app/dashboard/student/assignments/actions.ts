"use server";

import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

export interface SubmitResult { ok: boolean; error?: string }

function svc() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createAdminClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// Upload the (optional) submission image. Returns { path } on success,
// { error } on a real failure, or {} when no image was provided.
async function uploadImage(assignmentId: string, studentId: string, formData: FormData): Promise<{ path?: string; error?: string }> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return {};
  if (!file.type.startsWith("image/")) return { error: "Please upload an image file." };
  if (file.size > 8 * 1024 * 1024) return { error: "Image must be under 8 MB." };
  const admin = svc();
  if (!admin) return { error: "File uploads aren't configured on the server." };
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const path = `${studentId}/${assignmentId}.${ext}`;
  // Convert to bytes — passing a File directly can fail inside a Node server action.
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await admin.storage.from("assignment-files").upload(path, bytes, { upsert: true, contentType: file.type || "image/jpeg" });
  if (error) return { error: `Couldn't upload the image: ${error.message}. (Make sure the "assignment-files" storage bucket exists — run supabase/assignment-uploads.sql.)` };
  return { path };
}

async function save(formData: FormData, status: "draft" | "submitted"): Promise<SubmitResult> {
  const profile = await getProfile();
  if (!profile) return { ok: false, error: "Please sign in." };
  const assignmentId = String(formData.get("assignment_id") ?? "");
  if (!assignmentId) return { ok: false, error: "Missing assignment." };

  const up = await uploadImage(assignmentId, profile.id, formData);
  if (up.error) return { ok: false, error: up.error };

  const values: Record<string, unknown> = {
    assignment_id: assignmentId,
    student_id: profile.id,
    content: String(formData.get("content") ?? "") || null,
    drive_url: String(formData.get("drive_url") ?? "").trim() || null,
    status,
    ...(status === "submitted" ? { submitted_at: new Date().toISOString() } : {}),
    ...(up.path ? { file_url: up.path } : {}),
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from("assignment_submissions").upsert(values, { onConflict: "assignment_id,student_id" });
  if (error) {
    return { ok: false, error: /file_url/.test(error.message)
      ? 'The image column isn\'t set up yet. Run the "assignment-uploads.sql" migration in Supabase.'
      : `Could not save your submission: ${error.message}` };
  }

  revalidatePath(`/dashboard/student/assignments/${assignmentId}`);
  return { ok: true };
}

export async function saveDraft(formData: FormData): Promise<SubmitResult> {
  return save(formData, "draft");
}
export async function submitWork(formData: FormData): Promise<SubmitResult> {
  return save(formData, "submitted");
}
