"use server";

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

async function save(formData: FormData, status: "draft" | "submitted"): Promise<SubmitResult> {
  // Everything is wrapped so the action can NEVER throw — a thrown server
  // action is masked in production as the opaque "Server Components render"
  // error. We always hand the form a specific { ok, error } instead.
  try {
    const profile = await getProfile();
    if (!profile) return { ok: false, error: "Please sign in again — your session expired." };
    const assignmentId = String(formData.get("assignment_id") ?? "");
    if (!assignmentId) return { ok: false, error: "Missing assignment." };

    // The image was already uploaded to Storage by the browser; we only receive
    // its path. Guard that it lives in this student's own folder.
    const filePath = String(formData.get("file_path") ?? "").trim();
    if (filePath && !filePath.startsWith(`${profile.id}/`)) {
      return { ok: false, error: "That file doesn't belong to your account." };
    }

    const values: Record<string, unknown> = {
      assignment_id: assignmentId,
      student_id: profile.id,
      content: String(formData.get("content") ?? "") || null,
      drive_url: String(formData.get("drive_url") ?? "").trim() || null,
      status,
      ...(status === "submitted" ? { submitted_at: new Date().toISOString() } : {}),
      ...(filePath ? { file_url: filePath } : {}),
    };

    // Write with the service role so a stray RLS policy can't block or mask the
    // submission; fall back to the user client if the service key is absent.
    const db = svc() ?? (await createClient());
    const { error } = await db
      .from("assignment_submissions").upsert(values, { onConflict: "assignment_id,student_id" });
    if (error) {
      return { ok: false, error: /file_url/.test(error.message)
        ? 'The image column isn\'t set up yet. Run the "assignment-uploads.sql" migration in Supabase.'
        : `Could not save your submission: ${error.message}` };
    }

    // NOTE: no revalidatePath here — its post-return re-render is the one thing
    // this try/catch can't guard, and a render error there surfaces as the
    // masked error. The client calls router.refresh() after a successful save.
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? `Upload failed: ${e.message}` : "Upload failed unexpectedly." };
  }
}

export async function saveDraft(formData: FormData): Promise<SubmitResult> {
  return save(formData, "draft");
}
export async function submitWork(formData: FormData): Promise<SubmitResult> {
  return save(formData, "submitted");
}
