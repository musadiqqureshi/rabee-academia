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

export async function scheduleDemo(formData: FormData) {
  await requireStaff();
  const supabase = await createClient();
  const id = String(formData.get("demo_id") ?? "");
  const scheduledAt = String(formData.get("scheduled_at") ?? "");

  await supabase
    .from("demo_requests")
    .update({
      meet_link: String(formData.get("meet_link") ?? "").trim() || null,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      admin_notes: String(formData.get("admin_notes") ?? "").trim() || null,
      status: "scheduled",
    })
    .eq("id", id);

  revalidatePath("/dashboard/admin/demos");
}

export async function setDemoStatus(formData: FormData) {
  await requireStaff();
  const supabase = await createClient();
  const id = String(formData.get("demo_id") ?? "");
  const status = String(formData.get("status") ?? "pending");
  await supabase.from("demo_requests").update({ status }).eq("id", id);
  revalidatePath("/dashboard/admin/demos");
}
