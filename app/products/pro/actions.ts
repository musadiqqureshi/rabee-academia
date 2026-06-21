"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

export interface ProRequestResult {
  ok: boolean;
  error?: string;
}

const PRICE_PKR = 3000;

// Submit a Pro subscription request with a bank-transfer receipt. Mirrors the
// enrolment flow: creates a pending row an admin later approves.
export async function submitProRequest(formData: FormData): Promise<ProRequestResult> {
  const profile = await getProfile();
  if (!profile) return { ok: false, error: "Please sign in first." };

  const supabase = await createClient();

  // Block a duplicate pending request.
  const { data: existing } = await supabase
    .from("ai_pro_requests")
    .select("id, status")
    .eq("user_id", profile.id)
    .eq("status", "pending")
    .maybeSingle();
  if (existing) return { ok: false, error: "You already have a Pro request pending verification." };

  const months = Math.max(1, Number(formData.get("months") ?? 1) || 1);

  const { data: row, error: insErr } = await supabase
    .from("ai_pro_requests")
    .insert({ user_id: profile.id, months, amount_pkr: PRICE_PKR * months, status: "pending" })
    .select("id")
    .single();
  if (insErr || !row) return { ok: false, error: insErr?.message ?? "Could not submit your request." };

  // Upload the receipt to the user's own folder (storage RLS requires the
  // first path segment to be the user id).
  const receipt = formData.get("receipt");
  if (receipt instanceof File && receipt.size > 0) {
    const ext = (receipt.name.split(".").pop() ?? "jpg").toLowerCase();
    const path = `${profile.id}/pro-${row.id}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("receipts")
      .upload(path, receipt, { upsert: true, contentType: receipt.type || undefined });
    if (!upErr) {
      await supabase.from("ai_pro_requests").update({ receipt_url: path }).eq("id", row.id);
    }
  }

  revalidatePath("/products/pro");
  revalidatePath("/dashboard/admin/ai-pro");
  return { ok: true };
}
