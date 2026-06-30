"use server";

import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getProfile } from "@/lib/auth";

export interface AvatarResult { ok: boolean; error?: string; url?: string }

// Upload a profile avatar (server-side via service role) and save it on the
// user's profile. Public 'avatars' bucket so the URL is viewable everywhere.
export async function updateAvatar(formData: FormData): Promise<AvatarResult> {
  const profile = await getProfile();
  if (!profile) return { ok: false, error: "Please sign in." };

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Please choose an image." };
  if (!file.type.startsWith("image/")) return { ok: false, error: "Please choose an image file." };
  if (file.size > 4 * 1024 * 1024) return { ok: false, error: "Image must be under 4 MB." };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { ok: false, error: "Avatar upload isn't configured." };
  const admin = createAdminClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const path = `${profile.id}/avatar.${ext}`;
  const { error: upErr } = await admin.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type || undefined });
  if (upErr) return { ok: false, error: "Upload failed. Please try again." };

  const { data: pub } = admin.storage.from("avatars").getPublicUrl(path);
  const publicUrl = `${pub.publicUrl}?v=${Date.now()}`; // cache-bust
  await admin.from("profiles").update({ avatar_url: publicUrl }).eq("id", profile.id);

  revalidatePath("/dashboard/student/profile");
  revalidatePath("/dashboard/teacher/profile");
  revalidatePath("/dashboard/admin/profile");
  return { ok: true, url: publicUrl };
}
