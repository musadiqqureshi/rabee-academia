"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function createSubject(formData: FormData) {
  const profile = await getProfile();
  if (!profile || !["admin","super_admin"].includes(profile.role)) throw new Error("Not authorized");
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required");
  const slug = String(formData.get("slug") ?? "").trim() || slugify(name);

  const { error } = await supabase.from("subjects").insert({
    slug,
    name,
    level: String(formData.get("level") ?? "").trim() || "General",
    regular_price: Number(formData.get("regular_price") ?? 0) || 0,
    weekend_price: Number(formData.get("weekend_price") ?? 0) || 0,
    lessons: Number(formData.get("lessons") ?? 0) || 0,
    description: String(formData.get("description") ?? "").trim() || null,
    is_active: true,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/admin/subjects");
  revalidatePath("/pricing");
}

async function requireStaff() {
  const profile = await getProfile();
  if (!profile || !["admin", "super_admin"].includes(profile.role)) throw new Error("Not authorized");
}

// Delete a subject. Hard-delete when nothing references it; if enrollments or
// batches still point to it, fall back to deactivating so the catalogue stays
// consistent (it just disappears from the public pages).
export async function deleteSubject(formData: FormData) {
  await requireStaff();
  const supabase = await createClient();
  const id = String(formData.get("subject_id") ?? "");
  if (!id) throw new Error("Missing subject");

  const { error } = await supabase.from("subjects").delete().eq("id", id);
  if (error) {
    await supabase.from("subjects").update({ is_active: false }).eq("id", id);
  }
  revalidatePath("/dashboard/admin/subjects");
  revalidatePath("/pricing");
}

// Toggle a subject's visibility on the public pages.
export async function setSubjectActive(formData: FormData) {
  await requireStaff();
  const supabase = await createClient();
  const id = String(formData.get("subject_id") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  if (!id) throw new Error("Missing subject");

  await supabase.from("subjects").update({ is_active: active }).eq("id", id);
  revalidatePath("/dashboard/admin/subjects");
  revalidatePath("/pricing");
}
