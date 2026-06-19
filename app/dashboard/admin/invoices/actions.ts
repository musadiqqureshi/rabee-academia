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
