"use server";

import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getProfile } from "@/lib/auth";
import { notifyAdmins } from "@/lib/notify";

export interface ScholarshipResult { ok: boolean; error?: string }

function svc() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createAdminClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function submitScholarship(formData: FormData): Promise<ScholarshipResult> {
  const profile = await getProfile();
  if (!profile) return { ok: false, error: "Please sign in to apply." };
  const admin = svc();
  if (!admin) return { ok: false, error: "Applications aren't available right now." };

  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const fullName = get("full_name") || profile.full_name || "";
  const email = get("email") || profile.email || "";
  const reason = get("reason");
  if (!fullName || !email || !reason) return { ok: false, error: "Name, email and your reason for applying are required." };

  // One application per user.
  const { data: existing } = await admin
    .from("scholarship_applications").select("id").eq("user_id", profile.id).maybeSingle();
  if (existing) { revalidatePath("/scholarships"); return { ok: true }; }

  // Optional supporting document → private bucket.
  let documentUrl: string | null = null;
  const doc = formData.get("document");
  if (doc instanceof File && doc.size > 0) {
    if (doc.size > 6 * 1024 * 1024) return { ok: false, error: "Document must be under 6 MB." };
    const ext = (doc.name.split(".").pop() ?? "pdf").toLowerCase();
    const path = `${profile.id}/proof.${ext}`;
    const { error: upErr } = await admin.storage
      .from("scholarship-docs").upload(path, doc, { upsert: true, contentType: doc.type || undefined });
    if (!upErr) documentUrl = path;
  }

  const numOrNull = (k: string) => { const n = Number(get(k)); return Number.isFinite(n) && n > 0 ? Math.round(n) : null; };

  const { error } = await admin.from("scholarship_applications").insert({
    user_id: profile.id,
    full_name: fullName,
    email,
    phone: get("phone") || profile.phone || null,
    subject_slug: get("subject_slug") || null,
    subject_name: get("subject_name") || null,
    monthly_income: numOrNull("monthly_income"),
    household_size: numOrNull("household_size"),
    reason,
    document_url: documentUrl,
    status: "submitted",
  });
  if (error) return { ok: false, error: "Could not submit your application. Please try again." };

  await notifyAdmins(
    "New scholarship application",
    `${fullName} (${email}) applied for a need-based scholarship. Please review it in the admin panel.`,
  ).catch(() => {});

  revalidatePath("/scholarships");
  revalidatePath("/dashboard/admin/scholarships");
  return { ok: true };
}
