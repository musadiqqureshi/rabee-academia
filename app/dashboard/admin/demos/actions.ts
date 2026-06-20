"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { notifyUser } from "@/lib/notify";

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

  // Notify a registered requester (in-app + email).
  const { data: demo } = await supabase
    .from("demo_requests").select("requester_id, meet_link, scheduled_at").eq("id", id).maybeSingle();
  if (demo?.requester_id) {
    const when = demo.scheduled_at ? new Date(demo.scheduled_at).toLocaleString() : "soon";
    await notifyUser(
      supabase as never,
      demo.requester_id,
      "Your demo class is scheduled",
      `Your free demo class is scheduled for ${when}. Join link: ${demo.meet_link ?? "will be shared shortly"}.`,
    );
  }

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
