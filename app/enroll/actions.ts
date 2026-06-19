"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

export interface EnrollResult {
  ok: boolean;
  error?: string;
  enrollmentId?: string;
}

// Find or create the subject for a given course slug (keeps the DB in sync with
// the static course catalog so enrollments always link to a real subject row).
async function resolveSubjectId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  course: { slug: string; name: string; level: string; lessons: number; regularPrice: number; weekendPrice: number },
): Promise<string | null> {
  const { data: existing } = await supabase
    .from("subjects").select("id").eq("slug", course.slug).maybeSingle();
  if (existing) return existing.id;

  const { data: created } = await supabase
    .from("subjects")
    .insert({
      slug: course.slug,
      name: course.name,
      level: course.level,
      lessons: course.lessons,
      regular_price: course.regularPrice,
      weekend_price: course.weekendPrice,
      is_active: true,
    })
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

  const subjectId = await resolveSubjectId(supabase, course);
  if (!subjectId) return { ok: false, error: "Could not resolve the selected course." };

  // Prevent duplicate enrolment in the same subject.
  const { data: dupe } = await supabase
    .from("enrollments").select("id").eq("student_id", profile.id).eq("subject_id", subjectId).maybeSingle();
  if (dupe) return { ok: false, error: "You are already enrolled in this course." };

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
      payment_method: payMethod,
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

  // Payment record (pending verification).
  const monthYear = new Date().toISOString().slice(0, 7); // YYYY-MM
  await supabase.from("payments").insert({
    enrollment_id: enrollment.id,
    student_id: profile.id,
    amount_pkr: amount,
    month_year: monthYear,
    status: "pending",
    payment_method: payMethod,
    receipt_url: receiptPath,
  });

  // Branded invoice for the registration.
  await supabase.from("invoices").insert({
    student_id: profile.id,
    enrollment_id: enrollment.id,
    subject_id: subjectId,
    category: "registration",
    description: `${course.name} — ${classType} classes`,
    amount_pkr: amount,
    status: "issued",
    due_date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
  });

  revalidatePath("/dashboard/student");
  revalidatePath("/dashboard/admin/enrollments");
  return { ok: true, enrollmentId: enrollment.id };
}
