"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { chatComplete, aiConfigured } from "@/lib/ai";

async function requireStaff() {
  const profile = await getProfile();
  if (!profile || !["admin", "super_admin"].includes(profile.role)) throw new Error("Not authorized");
}

export async function setBatchSchedule(formData: FormData) {
  await requireStaff();
  const supabase = await createClient();
  const batchId = String(formData.get("batch_id") ?? "");
  const text = String(formData.get("schedule_text") ?? "").trim() || null;
  await supabase.from("batches").update({ schedule_text: text }).eq("id", batchId);
  revalidatePath("/dashboard/admin/schedules");
}

// Ask AI to propose a sensible weekly schedule for each active batch and save
// it to batches.schedule_text.
export async function generateScheduleWithAI() {
  await requireStaff();
  if (!aiConfigured()) throw new Error("AI is not configured. Set AI_BASE_URL + AI_API_KEY.");
  const supabase = await createClient();

  const { data: batches } = await supabase
    .from("batches")
    .select("id, class_type, subjects:subject_id ( name )")
    .eq("is_active", true);

  const list = (batches ?? []).map((b) => ({
    id: b.id,
    subject: (b.subjects as unknown as { name: string } | null)?.name ?? "Subject",
    class_type: b.class_type,
  }));
  if (list.length === 0) return;

  const prompt = `Propose a weekly class schedule for an online academy. Regular classes run Mon–Fri, weekend classes run Sat–Sun, between 9 AM and 9 PM, avoiding clashes. For each batch return a short human-readable schedule like "Mon, Wed, Fri · 5:00–6:00 PM".
Respond ONLY with JSON: {"schedules":[{"id":"<batch id>","text":"<schedule>"}]}.

Batches:
${JSON.stringify(list, null, 2)}`;

  const text = await chatComplete(
    "You are an academic scheduler. Respond with valid JSON only.",
    [{ role: "user", content: prompt }],
    { maxTokens: 2000 },
  );
  const parsed = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  for (const item of parsed.schedules ?? []) {
    if (item.id && item.text) {
      await supabase.from("batches").update({ schedule_text: String(item.text) }).eq("id", item.id);
    }
  }
  revalidatePath("/dashboard/admin/schedules");
}
