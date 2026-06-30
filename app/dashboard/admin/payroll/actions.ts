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
}

// Set a teacher's individual salary (base + per-student rate).
export async function saveSalaryConfig(formData: FormData) {
  await requireAdmin();
  const admin = svc(); if (!admin) return;
  const teacherId = String(formData.get("teacher_id") ?? "");
  const perStudent = Math.max(0, Math.round(Number(formData.get("per_student_rate") ?? 0)) || 0);
  const base = Math.max(0, Math.round(Number(formData.get("base_amount") ?? 0)) || 0);
  if (!teacherId) return;
  await admin.from("teacher_salary_config").upsert(
    { teacher_id: teacherId, per_student_rate: perStudent, base_amount: base, updated_at: new Date().toISOString() },
    { onConflict: "teacher_id" },
  );
  revalidatePath("/dashboard/admin/payroll");
}

// Snapshot and record this month's salary as paid for a teacher.
export async function markSalaryPaid(formData: FormData) {
  await requireAdmin();
  const admin = svc(); if (!admin) return;
  const teacherId = String(formData.get("teacher_id") ?? "");
  const monthYear = String(formData.get("month_year") ?? "").trim();
  const amount = Math.max(0, Math.round(Number(formData.get("amount") ?? 0)) || 0);
  const count = Math.max(0, Math.round(Number(formData.get("student_count") ?? 0)) || 0);
  if (!teacherId || !monthYear) return;
  await admin.from("salary_payments").upsert(
    { teacher_id: teacherId, month_year: monthYear, amount, student_count: count, status: "paid", paid_at: new Date().toISOString() },
    { onConflict: "teacher_id,month_year" },
  );
  await notifyUser(admin as never, teacherId, "Salary paid",
    `Your salary for ${monthYear} (PKR ${amount.toLocaleString("en-PK")}) has been marked as paid. Thank you!`).catch(() => {});
  revalidatePath("/dashboard/admin/payroll");
}
