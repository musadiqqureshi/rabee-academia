"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { notifyAdmins } from "@/lib/notify";
import { sendEmail, notificationEmailHtml } from "@/lib/email";

export interface QuranRegResult { ok: boolean; error?: string }

// Quran Learning registration / free-assessment requests land in the same
// `demo_requests` table the admin dashboard already manages (Demos page).
// Quran-specific fields are packed into the `message` column so no schema
// change is needed and admins see everything in one place.
export async function submitQuranRegistration(formData: FormData): Promise<QuranRegResult> {
  const supabase = await createClient();
  const profile = await getProfile(); // may be null (public visitor)

  const get = (k: string) => String(formData.get(k) ?? "").trim();

  const studentName = get("student_name");
  const email = get("email");
  const whatsapp = get("whatsapp");
  if (!studentName || !email) return { ok: false, error: "Student name and email are required." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "Please enter a valid email address." };

  const preferredTiming = get("preferred_timing");
  const level = get("level");

  const details: [string, string][] = [
    ["Parent / Guardian", get("parent_name")],
    ["Age", get("age")],
    ["Gender", get("gender")],
    ["Country", get("country")],
    ["Time zone", get("timezone")],
    ["Preferred language", get("language")],
    ["Learning goal", get("goal")],
  ];
  const message =
    "Quran Learning registration\n" +
    details.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n");

  const { error } = await supabase.from("demo_requests").insert({
    requester_id: profile?.id ?? null,
    full_name: studentName,
    email,
    phone: whatsapp || null,
    subject_slug: "quran-learning",
    subject_name: "Quran Learning",
    education_level: level || null,
    preferred_times: preferredTiming ? [preferredTiming] : [],
    message,
    status: "pending",
  });
  if (error) return { ok: false, error: "Could not submit your registration. Please try again." };

  // Best-effort confirmation + admin heads-up (never block the user on these).
  await sendEmail({
    to: email,
    subject: "Your Quran Learning registration — Rabee Academia",
    html: notificationEmailHtml(
      "Registration received 🌙",
      `Assalamu Alaikum ${studentName}, thank you for registering for Quran Learning at Rabee Academia. Our team will contact you shortly to arrange your free assessment and assign a qualified teacher.`,
    ),
  }).catch(() => false);
  await notifyAdmins("New Quran Learning registration", `${studentName} (${email}) registered for Quran Learning.`).catch(() => {});

  revalidatePath("/dashboard/admin/demos");
  return { ok: true };
}
