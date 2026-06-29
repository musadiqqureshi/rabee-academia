"use server";

import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { notifyAdmins } from "@/lib/notify";
import { APPLICATION_FEE, generateCode } from "@/lib/instructor";

export interface ActionResult { ok: boolean; error?: string }

// Service-role client (bypasses RLS) — students can't insert into `invoices`,
// so the application-fee invoice must be written with the service role.
function svc() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createAdminClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

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
    .from("instructor_applications").select("id, code, subject_name").eq("user_id", profile.id).maybeSingle();
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

  // Create an invoice so the fee shows up in the admin Invoices section. Written
  // with the service role (students can't insert into `invoices`). Best-effort,
  // and de-duped so re-uploading a receipt doesn't create a second invoice.
  const admin = svc();
  if (admin) {
    const description = `Instructor application fee — ${app.subject_name} (code ${app.code})`;
    const { data: dup } = await admin
      .from("invoices").select("id").eq("student_id", profile.id).eq("description", description).maybeSingle();
    if (!dup) {
      await admin.from("invoices").insert({
        student_id: profile.id,
        category: "registration",
        description,
        amount_pkr: APPLICATION_FEE,
        status: "issued",
        due_date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
      }).then(() => null, () => null);
    }
  }

  await notifyAdmins(
    "New instructor application + payment",
    `${profile.full_name ?? profile.email} (code ${app.code}) submitted an instructor application and the PKR ${APPLICATION_FEE} fee. Please verify the payment to unlock their test.`,
  );

  revalidatePath("/instructor");
  revalidatePath("/dashboard/admin/instructors");
  return { ok: true };
}
