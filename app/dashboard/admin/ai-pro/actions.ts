"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { notifyUser } from "@/lib/notify";

async function requireStaff() {
  const profile = await getProfile();
  if (!profile || !["admin", "super_admin"].includes(profile.role)) throw new Error("Not authorized");
}

export async function approveProRequest(formData: FormData) {
  await requireStaff();
  const supabase = await createClient();
  const id = String(formData.get("request_id") ?? "");

  const { error } = await supabase.rpc("approve_pro_request", { req_id: id });
  if (error) throw new Error(error.message);

  const { data: r } = await supabase.from("ai_pro_requests").select("user_id").eq("id", id).maybeSingle();
  if (r?.user_id) {
    await notifyUser(
      supabase as never,
      r.user_id,
      "Rabee's AI Pro activated 🎉",
      "Your Pro subscription is now active. Enjoy unlimited exam papers and downloads!",
    );
  }
  revalidatePath("/dashboard/admin/ai-pro");
}

export async function rejectProRequest(formData: FormData) {
  await requireStaff();
  const supabase = await createClient();
  const id = String(formData.get("request_id") ?? "");

  const { error } = await supabase.rpc("reject_pro_request", { req_id: id });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/admin/ai-pro");
}
