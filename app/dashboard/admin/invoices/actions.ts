"use server";

import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { generateMonthlyInvoices } from "@/lib/monthlyInvoices";

async function requireStaff() {
  const profile = await getProfile();
  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    throw new Error("Not authorized");
  }
  return profile;
}

function svc() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createAdminClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// Manually generate this month's fee invoices (same logic as the monthly cron).
export async function generateMonthlyInvoicesNow() {
  await requireStaff();
  const admin = svc(); if (!admin) return;
  await generateMonthlyInvoices(admin);
  revalidatePath("/dashboard/admin/invoices");
}

// Set (or clear) a per-student monthly-fee discount. subject_id empty = all subjects.
export async function setStudentDiscount(formData: FormData) {
  await requireStaff();
  const admin = svc(); if (!admin) return;
  const studentId = String(formData.get("student_id") ?? "");
  const subjectId = String(formData.get("subject_id") ?? "") || null;
  const pct = Math.max(0, Math.min(100, Math.round(Number(formData.get("discount_pct") ?? 0)) || 0));
  if (!studentId) return;

  // Manual upsert so NULL subject_id (all subjects) doesn't duplicate.
  let q = admin.from("student_fee_discounts").select("id").eq("student_id", studentId);
  q = subjectId ? q.eq("subject_id", subjectId) : q.is("subject_id", null);
  const { data: existing } = await q.maybeSingle();
  if (existing) {
    if (pct === 0) await admin.from("student_fee_discounts").delete().eq("id", existing.id);
    else await admin.from("student_fee_discounts").update({ discount_pct: pct }).eq("id", existing.id);
  } else if (pct > 0) {
    await admin.from("student_fee_discounts").insert({ student_id: studentId, subject_id: subjectId, discount_pct: pct });
  }
  revalidatePath("/dashboard/admin/invoices");
}

export async function createInvoice(formData: FormData) {
  await requireStaff();
  const supabase = await createClient();

  const studentId = String(formData.get("student_id") ?? "");
  if (!studentId) throw new Error("A student is required");

  const dueRaw = String(formData.get("due_date") ?? "");

  const { error } = await supabase.from("invoices").insert({
    student_id: studentId,
    subject_id: String(formData.get("subject_id") ?? "") || null,
    category: String(formData.get("category") ?? "monthly_fee"),
    description: String(formData.get("description") ?? "").trim() || null,
    amount_pkr: Number(formData.get("amount_pkr") ?? 0) || 0,
    status: "issued",
    due_date: dueRaw || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/admin/invoices");
}

export async function setInvoiceStatus(formData: FormData) {
  await requireStaff();
  const supabase = await createClient();
  const id = String(formData.get("invoice_id") ?? "");
  const status = String(formData.get("status") ?? "issued");

  const { error } = await supabase
    .from("invoices")
    .update({ status, paid_at: status === "paid" ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/admin/invoices");
}
