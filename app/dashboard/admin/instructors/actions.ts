"use server";

import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getProfile } from "@/lib/auth";
import { notifyUser } from "@/lib/notify";
import { APPLICATION_FEE } from "@/lib/instructor";

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

async function getApp(admin: NonNullable<ReturnType<typeof svc>>, id: string) {
  const { data } = await admin.from("instructor_applications").select("id, user_id, code, subject_name, status").eq("id", id).maybeSingle();
  return data as { id: string; user_id: string; code: string; subject_name: string; status: string } | null;
}

// Make sure the application-fee invoice exists and is marked paid (handles
// applications that paid before invoices were generated).
async function ensurePaidInvoice(admin: NonNullable<ReturnType<typeof svc>>, app: { user_id: string; code: string; subject_name: string }) {
  const { data: inv } = await admin.from("invoices").select("id")
    .eq("student_id", app.user_id).ilike("description", `%code ${app.code}%`).maybeSingle();
  if (inv) {
    await admin.from("invoices").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", inv.id);
  } else {
    await admin.from("invoices").insert({
      student_id: app.user_id,
      category: "registration",
      description: `Instructor application fee — ${app.subject_name} (code ${app.code})`,
      amount_pkr: APPLICATION_FEE,
      status: "paid",
      paid_at: new Date().toISOString(),
      due_date: new Date().toISOString().slice(0, 10),
    }).then(() => null, () => null);
  }
}

export async function verifyPayment(formData: FormData) {
  await requireAdmin();
  const admin = svc(); if (!admin) return;
  const id = String(formData.get("id") ?? "");
  const app = await getApp(admin, id); if (!app) return;
  await admin.from("instructor_applications").update({ payment_status: "verified", status: "test_unlocked" }).eq("id", id);
  await ensurePaidInvoice(admin, app);
  await notifyUser(admin as never, app.user_id, "Fee verified — your test is unlocked",
    `Your instructor assessment fee (code ${app.code}) is verified. Your ${app.subject_name} test is now unlocked in your instructor portal — good luck!`);
  revalidatePath("/dashboard/admin/instructors");
}

export async function rejectPayment(formData: FormData) {
  await requireAdmin();
  const admin = svc(); if (!admin) return;
  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;
  const app = await getApp(admin, id); if (!app) return;
  await admin.from("instructor_applications").update({ payment_status: "rejected", status: "rejected", admin_notes: note }).eq("id", id);
  await notifyUser(admin as never, app.user_id, "Instructor application update", note || "We couldn't verify your payment. Please contact us.");
  revalidatePath("/dashboard/admin/instructors");
}

export async function setInterview(formData: FormData) {
  await requireAdmin();
  const admin = svc(); if (!admin) return;
  const id = String(formData.get("id") ?? "");
  const when = String(formData.get("interview_at") ?? "");
  const app = await getApp(admin, id); if (!app) return;
  await admin.from("instructor_applications").update({
    interview_at: when ? new Date(when).toISOString() : null,
    status: "interview_scheduled",
  }).eq("id", id);
  await notifyUser(admin as never, app.user_id, "Your instructor interview is scheduled",
    `Congratulations on qualifying! Your interview${when ? ` is scheduled for ${new Date(when).toLocaleString()}` : " date will be shared shortly"}.`);
  revalidatePath("/dashboard/admin/instructors");
}

export async function hire(formData: FormData) {
  await requireAdmin();
  const admin = svc(); if (!admin) return;
  const id = String(formData.get("id") ?? "");
  const app = await getApp(admin, id); if (!app) return;
  await admin.from("profiles").update({ role: "teacher" }).eq("id", app.user_id);
  await admin.from("instructor_applications").update({ status: "hired" }).eq("id", id);
  await notifyUser(admin as never, app.user_id, "Welcome to Rabee Academia! 🎉",
    `You've been hired as an instructor for ${app.subject_name}. Sign in and head to your teacher dashboard to get started.`);
  revalidatePath("/dashboard/admin/instructors");
}

export async function rejectApplication(formData: FormData) {
  await requireAdmin();
  const admin = svc(); if (!admin) return;
  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;
  const app = await getApp(admin, id); if (!app) return;
  await admin.from("instructor_applications").update({ status: "rejected", admin_notes: note }).eq("id", id);
  await notifyUser(admin as never, app.user_id, "Instructor application update", note || "Your application was not accepted at this time.");
  revalidatePath("/dashboard/admin/instructors");
}
