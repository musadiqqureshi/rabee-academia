"use server";

import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { getCourse, type Course } from "@/lib/courses";
import { notifyAdmins } from "@/lib/notify";

export interface EnrollResult {
  ok: boolean;
  error?: string;
  enrollmentId?: string;
}

interface SubjectRecord {
  id: string;
  name: string;
  regular_price: number;
  weekend_price: number;
}

const SUBJECT_COLS = "id, name, regular_price, weekend_price";

// Resolve the subject row for a course slug. Admin-managed subjects already live
// in the DB (public-readable), so we return them directly. If a slug from the
// static catalog isn't seeded yet (e.g. AI Mastery), we create it from the
// authoritative catalog using the service role — RLS restricts subject inserts
// to admins, and we never trust client input for the new row's fields.
async function resolveSubject(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slug: string,
  staticCourse: Course | null,
): Promise<SubjectRecord | null> {
  const { data: existing } = await supabase
    .from("subjects").select(SUBJECT_COLS).eq("slug", slug).maybeSingle();
  if (existing) return existing as SubjectRecord;

  if (!staticCourse) return null;
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
        slug: staticCourse.slug,
        name: staticCourse.name,
        level: staticCourse.level,
        lessons: staticCourse.lessons,
        regular_price: staticCourse.regularPrice,
        weekend_price: staticCourse.weekendPrice,
        is_active: true,
      },
      { onConflict: "slug" },
    )
    .select(SUBJECT_COLS)
    .maybeSingle();
  return (created as SubjectRecord) ?? null;
}

export async function submitEnrollment(formData: FormData): Promise<EnrollResult> {
  const profile = await getProfile();
  if (!profile) return { ok: false, error: "Please sign in to enrol." };

  // Only students enrol. Staff accounts get a clear message instead of a row.
  if (profile.role !== "student") {
    const who = profile.role === "teacher" ? "a teacher" : "an admin";
    return { ok: false, error: `You're signed in as ${who} — only students can enrol in courses. Please use a student account.` };
  }

  const supabase = await createClient();

  const slug = String(formData.get("slug") ?? "");
  const classType = (String(formData.get("type") ?? "regular") as "regular" | "weekend");
  const payMethod = String(formData.get("pay_method") ?? "iban") as "assanpay" | "iban";

  const staticCourse = getCourse(slug);
  const subject = await resolveSubject(supabase, slug, staticCourse);
  if (!subject) return { ok: false, error: "Could not resolve the selected course." };
  const subjectId = subject.id;

  // Special flags (free / seat-limited) only exist on the static catalog.
  const isFree = Boolean(staticCourse?.free);
  // Price is taken from the subject row, never from client input.
  const amount = classType === "weekend" ? subject.weekend_price : subject.regular_price;

  // Seat limit (e.g. AI Mastery — 30 seats). Use the SECURITY DEFINER RPC so
  // the count is accurate regardless of the caller's RLS view.
  if (staticCourse?.seatLimit) {
    const { data: taken } = await supabase.rpc("subject_enrolled_count", { p_subject: subjectId });
    if (Number(taken ?? 0) >= staticCourse.seatLimit) {
      return { ok: false, error: "Sorry, all seats for this course are full." };
    }
  }

  // One enrolment per (student, subject) is enforced by a unique constraint.
  // Block only when an active one exists; a previously rejected/cancelled row
  // is reactivated below so revoked students can enrol again.
  const { data: existing } = await supabase
    .from("enrollments").select("id, status").eq("student_id", profile.id).eq("subject_id", subjectId).maybeSingle();
  let reEnrollId: string | null = null;
  if (existing) {
    if (existing.status === "pending" || existing.status === "approved") {
      return { ok: false, error: "You are already enrolled in this course." };
    }
    reEnrollId = existing.id;
  }

  // Pricing: a course-level launch offer (e.g. Quran 11,000 → 5,000) takes
  // precedence; otherwise 20% off the student's first-ever enrolment (paid only).
  let finalAmount = amount;
  let discountLabel = "";
  if (!isFree) {
    if (staticCourse?.launchPrice && staticCourse.launchPrice < amount) {
      finalAmount = staticCourse.launchPrice;
      discountLabel = ` (launch offer — was ${amount.toLocaleString("en-PK")})`;
    } else {
      const { count: priorCount } = await supabase
        .from("enrollments").select("id", { count: "exact", head: true }).eq("student_id", profile.id);
      if ((priorCount ?? 0) === 0) {
        finalAmount = Math.round(amount * 0.8);
        discountLabel = " (20% first-enrolment discount)";
      }
    }
  }

  const row = {
    student_id: profile.id,
    subject_id: subjectId,
    class_type: classType,
    status: "pending" as const,
    student_name: String(formData.get("full_name") ?? profile.full_name ?? ""),
    student_email: String(formData.get("email") ?? profile.email ?? ""),
    student_phone: String(formData.get("phone") ?? ""),
    payment_method: isFree ? null : payMethod,
  };

  // Reactivate a revoked/rejected enrolment (the unique constraint forbids a
  // second row), otherwise create a fresh one.
  const { data: enrollment, error: enrollErr } = reEnrollId
    ? await supabase
        .from("enrollments")
        .update({ ...row, batch_id: null, teacher_id: null, meet_link: null, approved_by: null, approved_at: null, updated_at: new Date().toISOString() })
        .eq("id", reEnrollId)
        .select("id")
        .single()
    : await supabase
        .from("enrollments")
        .insert(row)
        .select("id")
        .single();
  if (enrollErr || !enrollment) return { ok: false, error: enrollErr?.message ?? "Enrolment failed." };

  // Email the academy team about the new enrolment (in-app + email via webhook).
  const studentName = String(formData.get("full_name") ?? profile.full_name ?? profile.email ?? "A student");
  const courseName = String(formData.get("course_name") ?? staticCourse?.name ?? "a course");
  await notifyAdmins(
    "New enrollment received",
    `${studentName} enrolled in ${courseName} (${classType}). Verify the payment and approve it in the admin panel.`,
  );

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
    description: `${subject.name} — ${classType} classes${discountLabel}`,
    amount_pkr: finalAmount,
    status: "issued",
    due_date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
  }).then(() => null, () => null);

  revalidatePath("/dashboard/student");
  revalidatePath("/dashboard/admin/enrollments");
  return { ok: true, enrollmentId: enrollment.id };
}
