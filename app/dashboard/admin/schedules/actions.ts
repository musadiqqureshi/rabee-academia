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

export interface ActionResult {
  ok: boolean;
  message: string;
}

// Ask AI to propose a sensible weekly schedule for each active batch and save
// it to batches.schedule_text. Returns a result the UI can show instead of
// throwing into the void (a bare server-action form swallows errors silently).
export async function generateScheduleWithAI(): Promise<ActionResult> {
  try {
    await requireStaff();
  } catch {
    return { ok: false, message: "Not authorized." };
  }

  if (!aiConfigured()) {
    return { ok: false, message: "AI is not configured. Set AI_BASE_URL + AI_API_KEY (OpenRouter/NVIDIA) or ANTHROPIC_API_KEY in your environment." };
  }

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
  if (list.length === 0) {
    return { ok: false, message: "No active batches yet — batches are created when you approve enrollments. There's nothing to schedule." };
  }

  const prompt = `Propose a weekly class schedule for an online academy. Regular classes run Mon–Fri, weekend classes run Sat–Sun, between 9 AM and 9 PM, avoiding clashes. For each batch return a short human-readable schedule like "Mon, Wed, Fri · 5:00–6:00 PM".
Respond ONLY with JSON: {"schedules":[{"id":"<batch id>","text":"<schedule>"}]}.

Batches:
${JSON.stringify(list, null, 2)}`;

  let text: string;
  try {
    text = await chatComplete(
      "You are an academic scheduler. Respond with valid JSON only.",
      [{ role: "user", content: prompt }],
      { maxTokens: 2000 },
    );
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "AI request failed." };
  }

  const parsed = parseSchedules(text);
  if (!parsed) {
    return { ok: false, message: "AI returned an unexpected response. Please try again." };
  }

  let updated = 0;
  for (const item of parsed) {
    if (item.id && item.text) {
      const { error } = await supabase
        .from("batches")
        .update({ schedule_text: String(item.text) })
        .eq("id", item.id);
      if (!error) updated++;
    }
  }

  revalidatePath("/dashboard/admin/schedules");
  return updated > 0
    ? { ok: true, message: `Generated schedules for ${updated} batch${updated === 1 ? "" : "es"}.` }
    : { ok: false, message: "Couldn't save any schedules. Please try again." };
}

// Free models often wrap JSON in prose or ```json fences. Strip fences, then
// take the outermost {...} block before parsing.
function parseSchedules(raw: string): { id: string; text: string }[] | null {
  const cleaned = raw.replace(/```(?:json)?/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    const obj = JSON.parse(cleaned.slice(start, end + 1));
    return Array.isArray(obj?.schedules) ? obj.schedules : null;
  } catch {
    return null;
  }
}
