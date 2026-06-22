"use server";

import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getProfile } from "@/lib/auth";
import type { UserRole } from "@/lib/supabase/types";

async function requireAdmin() {
  const profile = await getProfile();
  if (!profile || !["admin", "super_admin"].includes(profile.role)) throw new Error("Not authorized");
  return profile;
}

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set on the server.");
  return createAdminClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// Permanently delete a user (auth account + profile cascades). Cannot delete
// yourself.
export async function deleteUser(formData: FormData) {
  const me = await requireAdmin();
  const userId = String(formData.get("user_id") ?? "");
  if (!userId) throw new Error("Missing user");
  if (userId === me.id) throw new Error("You can't delete your own account.");

  const sb = admin();
  const { error } = await sb.auth.admin.deleteUser(userId);
  if (error) {
    // Often blocked by data the user still owns (e.g. a teacher with batches).
    throw new Error(error.message || "Could not delete this user (they may still own records).");
  }
  revalidatePath("/dashboard/admin/users");
  revalidatePath("/dashboard/admin/teachers");
}

// Change a user's role (e.g. revoke a teacher down to student, or promote).
export async function setUserRole(formData: FormData) {
  const me = await requireAdmin();
  const userId = String(formData.get("user_id") ?? "");
  const role = String(formData.get("role") ?? "") as UserRole;
  if (!userId || !["admin", "teacher", "student"].includes(role)) throw new Error("Invalid request");
  if (userId === me.id) throw new Error("You can't change your own role.");

  const sb = admin();
  await sb.auth.admin.updateUserById(userId, { user_metadata: { role }, app_metadata: { role } });
  const { error } = await sb.from("profiles").update({ role }).eq("id", userId);
  if (error) throw new Error(error.message);

  // Demoting from teacher: drop their subject assignments and deactivate batches.
  if (role !== "teacher") {
    await sb.from("teacher_subjects").delete().eq("teacher_id", userId);
  }
  revalidatePath("/dashboard/admin/users");
  revalidatePath("/dashboard/admin/teachers");
}
