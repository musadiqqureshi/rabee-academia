"use server";

import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { getCourse, type Course } from "@/lib/courses";

export interface EnrollResult {
  ok: boolean;
  error?: string;
  enrollmentId?: string;
}

// Find or create the subject for a given course slug (keeps the DB in sync with
// the static course catalog so enrollments always link to a real subject row).
// Reading is allowed for everyone; creating a missing subject requires the
// service role because RLS restricts subject inserts to admins. We therefore
// build the new row from the authoritative catalog (never client input), which
// also covers special courses (e.g. AI Mastery) that may not be pre-seeded.
async function resolveSubjectId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  catalog: Course,
): Promise<string | null> {
  const { data: existing } = await supabase
    .from("subjects").select("id").eq("slug", catalog.slug).maybeSingle();
  if (existing) return existing.id;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;

  const admin = createAdminClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: created } = await admin
    .from("subjects")
    .upsert(
      {
        slug: catalog.slug,
        name: catalog.name,
        level: catalog.level,
        lessons: catalog.lessons,
        regular_price: catalog.regularPrice,
        weekend_price: catalog.weekendPrice,
        is_active: true,
      },
      { onConflict: "slug" },
    )
    .select("id")
    .maybeSingle();
  return created?.id ?? null;
}

export async function submitEnrollment(formData: FormData): Promise<EnrollResult> {
  const profile = await getProfile();
  if (!profile) return { ok: false, error: "Please sign in to enrol." };

  const supabase = await createClient();

  const course = {
    slug: String(formData.get("slug") ?? ""),
    name: String(formData.get("course_name") ?? ""),
    level: String(formData.get("level") ?? ""),
    lessons: Number(formData.get("lessons") ?? 0) || 0,
    regularPrice: Number(formData.get("regular_price") ?? 0) || 0,
    weekendPrice: Number(formData.get("weekend_price") ?? 0) || 0,
  };
  const classType = (String(formData.get("type") ?? "regular") as "regular" | "weekend");
  const payMethod = String(formData.get("pay_method") ?? "iban") as "assanpay" | "iban";
  const amount = Number(formData.get("amount") ?? 0) || 0;

  const catalog = getCourse(course.slug);
  if (!catalog) return { ok: false, error: "Could not resolve the selected course." };
  const isFree = Boolean(catalog.free);

  const subjectId = await resolveSubjectId(supabase, catalog);
  if (!subjectId) return { ok: false, error: "Could not resolve the selected course." };

  // Seat limit (e.g. AI Mastery — 30 seats).
  if (catalog?.seatLimit) {
    const { count } = await supabase
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("subject_id", subjectId)
      .in("status", ["pending", "approved"]);
    if ((count ?? 0) >= catalog.seatLimit) {
      return { ok: false, error: "Sorry, all seats for this course are full." };
    }
  }

  // Prevent duplicate enrolment in the same subject.
  const { data: dupe } = await supabase
    .from("enrollments").select("id").eq("student_id", profile.id).eq("subject_id", subjectId).maybeSingle();
  if (dupe) return { ok: false, error: "You are already enrolled in this course." };

  // 20% discount on the student's first-ever enrolment (paid courses only).
  let finalAmount = amount;
  if (!isFree) {
    const { count: priorCount } = await supabase
      .from("enrollments").select("id", { count: "exact", head: true }).eq("student_id", profile.id);
    if ((priorCount ?? 0) === 0) finalAmount = Math.round(amount * 0.8);
  }

  const { data: enrollment, error: enrollErr } = await supabase
    .from("enrollments")
    .insert({
      student_id: profile.id,
      subject_id: subjectId,
      class_type: classType,
      status: "pending",
      student_name: String(formData.get("full_name") ?? profile.full_name ?? ""),
      student_email: String(formData.get("email") ?? profile.email ?? ""),
      student_phone: String(formData.get("phone") ?? ""),
      payment_method: isFree ? null : payMethod,
    })
    .select("id")
    .single();
  if (enrollErr || !enrollment) return { ok: false, error: enrollErr?.message ?? "Enrolment failed." };

  // Upload the bank-transfer receipt, if provided.
  let receiptPath: string | null = null;
  const receipt = formData.get("receipt");
  if (payMethod === "iban" && receipt instanceof File && receipt.size > 0) {
    const ext = (receipt.name.split(".").pop() ?? "jpg").toLowerCase();
    receiptPath = `${profile.id}/${enrollment.id}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("receipts")
      .upload(receiptPath, receipt, { upsert: true, contentType: receipt.type || undefined });
    if (upErr) {
      // Non-fatal: enrolment exists; admin can request the receipt again.
      receiptPath = null;
    } else {
      await supabase.from("enrollments").update({ receipt_url: receiptPath }).eq("id", enrollment.id);
    }
  }

  // Free courses skip payment + invoice entirely.
  if (isFree) {
    revalidatePath("/dashboard/student");
    revalidatePath("/dashboard/admin/enrollments");
    return { ok: true, enrollmentId: enrollment.id };
  }

  // Payment record — non-fatal if the table doesn't exist yet.
  const monthYear = new Date().toISOString().slice(0, 7); // YYYY-MM
  await supabase.from("payments").insert({
    enrollment_id: enrollment.id,
    student_id: profile.id,
    amount_pkr: finalAmount,
    month_year: monthYear,
    status: "pending",
    payment_method: payMethod,
    receipt_url: receiptPath,
  }).then(() => null, () => null);

  // Invoice — non-fatal if the table doesn't exist yet.
  await supabase.from("invoices").insert({
    student_id: profile.id,
    enrollment_id: enrollment.id,
    subject_id: subjectId,
    category: "registration",
    description: `${course.name} — ${classType} classes${finalAmount < amount ? " (20% first-enrolment discount)" : ""}`,
    amount_pkr: finalAmount,
    status: "issued",
    due_date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
  }).then(() => null, () => null);

  revalidatePath("/dashboard/student");
  revalidatePath("/dashboard/admin/enrollments");
  return { ok: true, enrollmentId: enrollment.id };
}
