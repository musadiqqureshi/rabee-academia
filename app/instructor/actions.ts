"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { notifyAdmins } from "@/lib/notify";
import { APPLICATION_FEE, generateCode } from "@/lib/instructor";

export interface ActionResult { ok: boolean; error?: string }

// Create the instructor application (one per user) with a unique code.
export async function submitApplication(formData: FormData): Promise<ActionResult> {
  const profile = await getProfile();
  if (!profile) return { ok: false, error: "Please sign in to apply." };

  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const fullName = get("full_name") || profile.full_name || "";
  const email = get("email") || profile.email || "";
  const subjectName = get("subject_name");
  if (!fullName || !email || !subjectName) {
    return { ok: false, error: "Name, email and the subject you want to teach are required." };
  }

  const supabase = await createClient();

  // Already applied? Treat as success so the portal just moves forward.
  const { data: existing } = await supabase
    .from("instructor_applications").select("id").eq("user_id", profile.id).maybeSingle();
  if (existing) { revalidatePath("/instructor"); return { ok: true }; }

  const row = {
    user_id: profile.id,
    full_name: fullName,
    email,
    phone: get("phone") || profile.phone || null,
    subject_slug: get("subject_slug") || null,
    subject_name: subjectName,
    qualifications: get("qualifications") || null,
    fee_amount: APPLICATION_FEE,
    status: "submitted" as const,
    payment_status: "pending" as const,
  };

  // Insert with a unique code, retrying once on the (rare) code collision.
  let lastErr = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    const { error } = await supabase.from("instructor_applications").insert({ ...row, code: generateCode() });
    if (!error) { revalidatePath("/instructor"); return { ok: true }; }
    lastErr = error.message;
    if (!/code/i.test(error.message)) break; // only retry on code uniqueness
  }
  return { ok: false, error: lastErr || "Could not submit your application. Please try again." };
}

// Attach the 1000 PKR fee receipt and move the application to "payment under review".
export async function submitPayment(formData: FormData): Promise<ActionResult> {
  const profile = await getProfile();
  if (!profile) return { ok: false, error: "Please sign in." };
  const supabase = await createClient();

  const { data: app } = await supabase
    .from("instructor_applications").select("id, code").eq("user_id", profile.id).maybeSingle();
  if (!app) return { ok: false, error: "No application found. Please apply first." };

  const receipt = formData.get("receipt");
  if (!(receipt instanceof File) || receipt.size === 0) {
    return { ok: false, error: "Please upload your payment screenshot." };
  }

  const ext = (receipt.name.split(".").pop() ?? "jpg").toLowerCase();
  const path = `${profile.id}/instructor-${app.id}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("receipts").upload(path, receipt, { upsert: true, contentType: receipt.type || undefined });

  const { error } = await supabase
    .from("instructor_applications")
    .update({
      receipt_url: upErr ? null : path,
      payment_method: "iban",
      status: "payment_submitted",
    })
    .eq("id", app.id);
  if (error) return { ok: false, error: "Could not submit your payment. Please try again." };

  await notifyAdmins(
    "New instructor application + payment",
    `${profile.full_name ?? profile.email} (code ${app.code}) submitted an instructor application and the PKR ${APPLICATION_FEE} fee. Please verify the payment to unlock their test.`,
  );

  revalidatePath("/instructor");
  revalidatePath("/dashboard/admin/instructors");
  return { ok: true };
}
