"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { notifyAdmins } from "@/lib/notify";

export interface DemoResult { ok: boolean; error?: string }

export async function createDemoRequest(formData: FormData): Promise<DemoResult> {
  const supabase = await createClient();
  const profile = await getProfile(); // may be null (public visitor)

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  if (!fullName || !email) return { ok: false, error: "Name and email are required." };

  const preferredTimes = formData.getAll("preferred_times").map(String).filter(Boolean);

  const { error } = await supabase.from("demo_requests").insert({
    requester_id: profile?.id ?? null,
    full_name: fullName,
    email,
    phone: String(formData.get("phone") ?? "").trim() || null,
    subject_slug: String(formData.get("subject_slug") ?? "") || null,
    subject_name: String(formData.get("subject_name") ?? "") || null,
    education_level: String(formData.get("education_level") ?? "") || null,
    preferred_times: preferredTimes,
    message: String(formData.get("message") ?? "").trim() || null,
    status: "pending",
  });
  if (error) return { ok: false, error: error.message };

  // Notify the academy team about the new demo-class request (in-app + email).
  const subjectName = String(formData.get("subject_name") ?? "").trim();
  const when = preferredTimes.length ? ` Preferred time(s): ${preferredTimes.join(", ")}.` : "";
  await notifyAdmins(
    "New free demo class request",
    `${fullName} requested a free demo class${subjectName ? ` for ${subjectName}` : ""} (${email}).${when} Schedule it in the admin Demo Requests panel.`,
  );

  revalidatePath("/dashboard/admin/demos");
  return { ok: true };
}
