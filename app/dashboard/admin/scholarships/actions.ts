"use server";

import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getProfile } from "@/lib/auth";
import { notifyUser } from "@/lib/notify";

function svc() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createAdminClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
async function requireAdmin() {
  const profile = await getProfile();
  if (!profile || !["admin", "super_admin"].includes(profile.role)) throw new Error("Not authorized");
  return profile;
}
async function getApp(admin: NonNullable<ReturnType<typeof svc>>, id: string) {
  const { data } = await admin.from("scholarship_applications").select("id, user_id, full_name").eq("id", id).maybeSingle();
  return data as { id: string; user_id: string; full_name: string } | null;
}

// Approve → set award + write a fixed-amount fee discount (applied to all subjects).
export async function approveScholarship(formData: FormData) {
  const me = await requireAdmin();
  const admin = svc(); if (!admin) return;
  const id = String(formData.get("id") ?? "");
  const amount = Math.max(0, Math.round(Number(formData.get("awarded_amount") ?? 0)) || 0);
  const validUntil = String(formData.get("valid_until") ?? "").trim() || null;
  const app = await getApp(admin, id); if (!app || amount <= 0) return;

  await admin.from("scholarship_applications").update({
    status: "approved", awarded_amount: amount, valid_until: validUntil, reviewed_by: me.id,
  }).eq("id", id);

  // Upsert a per-student all-subjects fixed discount (NULL subject_id can't use onConflict).
  const { data: existing } = await admin
    .from("student_fee_discounts").select("id").eq("student_id", app.user_id).is("subject_id", null).maybeSingle();
  const row = { discount_amount: amount, discount_pct: 0, valid_until: validUntil, note: "Need-based scholarship" };
  if (existing) await admin.from("student_fee_discounts").update(row).eq("id", existing.id);
  else await admin.from("student_fee_discounts").insert({ student_id: app.user_id, subject_id: null, ...row });

  await notifyUser(admin as never, app.user_id, "Scholarship approved 🎉",
    `Congratulations! You've been awarded a need-based scholarship of PKR ${amount.toLocaleString("en-PK")} off your monthly fee${validUntil ? ` (valid until ${validUntil})` : ""}. It will apply automatically to your invoices.`);
  revalidatePath("/dashboard/admin/scholarships");
}

export async function rejectScholarship(formData: FormData) {
  await requireAdmin();
  const admin = svc(); if (!admin) return;
  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;
  const app = await getApp(admin, id); if (!app) return;
  await admin.from("scholarship_applications").update({ status: "rejected", admin_notes: note }).eq("id", id);
  // Remove any scholarship discount that was previously granted.
  await admin.from("student_fee_discounts").delete().eq("student_id", app.user_id).is("subject_id", null).eq("note", "Need-based scholarship").then(() => null, () => null);
  await notifyUser(admin as never, app.user_id, "Scholarship application update", note || "Your scholarship application was not approved at this time.");
  revalidatePath("/dashboard/admin/scholarships");
}

export async function waitlistScholarship(formData: FormData) {
  await requireAdmin();
  const admin = svc(); if (!admin) return;
  const id = String(formData.get("id") ?? "");
  const app = await getApp(admin, id); if (!app) return;
  await admin.from("scholarship_applications").update({ status: "waitlisted" }).eq("id", id);
  await notifyUser(admin as never, app.user_id, "Scholarship — waitlisted",
    "Your scholarship application is strong, but our current slots are full. We'll contact you if one opens.");
  revalidatePath("/dashboard/admin/scholarships");
}
