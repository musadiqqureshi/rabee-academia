"use server";

import { createClient } from "@/lib/supabase/server";
import { sendEmail, notificationEmailHtml } from "@/lib/email";
import { notifyAdmins } from "@/lib/notify";

export interface WaitlistResult { ok: boolean; error?: string }

export async function joinWaitlist(formData: FormData): Promise<WaitlistResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim() || null;
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "Please enter a valid email address." };

  const supabase = await createClient();
  const { error } = await supabase.from("waitlist").insert({ email, name, source: "ai-career-stack" });
  // Duplicate email = already on the list; treat as success.
  if (error && !/duplicate|unique/i.test(error.message)) {
    return { ok: false, error: "Could not join the waitlist. Please try again." };
  }

  // Confirmation email to the user + heads-up to admins (best effort).
  await sendEmail({
    to: email,
    subject: "You're on the Rabee AI Career Stack waitlist 🎉",
    html: notificationEmailHtml(
      "You're on the waitlist!",
      "Thanks for joining the Rabee AI Career Stack waitlist. We'll email you the moment it launches — including your first-100 launch discount.",
    ),
  }).catch(() => false);
  await notifyAdmins("New AI Career Stack waitlist signup", `${name ?? email} joined the waitlist.`);

  return { ok: true };
}
