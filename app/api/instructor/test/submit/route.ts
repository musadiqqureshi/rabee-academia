import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { chatComplete } from "@/lib/ai";
import { TOOL_MODELS } from "@/lib/aiTool";
import { notifyAdmins } from "@/lib/notify";
import { PASS_MARK, combinedScore, type FullTest } from "@/lib/instructor";

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createAdminClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// AI-grade the long answers → { scores:number[], feedback:string }. Falls back
// to mirroring the MCQ percentage if the model is unavailable, so a grading
// hiccup never unfairly fails a candidate.
async function gradeLong(subject: string, items: { prompt: string; answer: string }[], fallbackPct: number): Promise<{ pct: number; feedback: string }> {
  const answered = items.filter((i) => i.answer.trim());
  if (answered.length === 0) return { pct: 0, feedback: "No long answers were provided." };
  const system = `You are grading a prospective ${subject} teacher's long-answer responses. For each answer give an integer 0-100 for correctness, depth and clarity, then 1-2 sentences of overall feedback. Return ONLY JSON: {"scores":[..],"feedback":"..."}`;
  const user = items.map((it, i) => `Q${i + 1}: ${it.prompt}\nAnswer: ${it.answer || "(blank)"}`).join("\n\n");
  try {
    const raw = await chatComplete(system, [{ role: "user", content: user }], { maxTokens: 1500, models: TOOL_MODELS });
    const s = raw.replace(/```(?:json)?/gi, "");
    const obj = JSON.parse(s.slice(s.indexOf("{"), s.lastIndexOf("}") + 1));
    const scores: number[] = Array.isArray(obj.scores) ? obj.scores.map((n: unknown) => Math.max(0, Math.min(100, Number(n) || 0))) : [];
    if (!scores.length) return { pct: fallbackPct, feedback: typeof obj.feedback === "string" ? obj.feedback : "" };
    const pct = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    return { pct, feedback: typeof obj.feedback === "string" ? obj.feedback : "" };
  } catch {
    return { pct: fallbackPct, feedback: "Long answers will be reviewed at interview." };
  }
}

export async function POST(req: Request) {
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  let body: { mcqAnswers?: number[]; longAnswers?: string[] };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const mcqAnswers = Array.isArray(body.mcqAnswers) ? body.mcqAnswers : [];
  const longAnswers = Array.isArray(body.longAnswers) ? body.longAnswers.map(String) : [];

  const supabase = await createClient();
  const { data: app } = await supabase
    .from("instructor_applications").select("id, subject_name, status, code").eq("user_id", profile.id).maybeSingle();
  if (!app) return NextResponse.json({ error: "No application found." }, { status: 404 });
  if (app.status !== "test_unlocked") return NextResponse.json({ error: "This test can no longer be submitted." }, { status: 409 });

  const svc = admin();
  if (!svc) return NextResponse.json({ error: "Server not configured." }, { status: 503 });
  const { data: testRow } = await svc.from("instructor_tests").select("questions, status").eq("application_id", app.id).maybeSingle();
  if (!testRow || testRow.status !== "generated") return NextResponse.json({ error: "No active test to submit." }, { status: 409 });

  const test = testRow.questions as FullTest;

  // Auto-grade MCQs.
  const correct = test.mcqs.reduce((acc, m, i) => acc + (mcqAnswers[i] === m.answer ? 1 : 0), 0);
  const mcqPct = test.mcqs.length ? Math.round((correct / test.mcqs.length) * 100) : 0;

  // AI-grade long answers.
  const longItems = test.long.map((l, i) => ({ prompt: l.prompt, answer: longAnswers[i] ?? "" }));
  const long = await gradeLong(app.subject_name, longItems, mcqPct);

  const total = combinedScore(mcqPct, long.pct);
  const passed = total >= PASS_MARK;

  await svc.from("instructor_tests").update({
    mcq_answers: mcqAnswers,
    long_answers: longAnswers,
    mcq_score: mcqPct,
    long_score: long.pct,
    total_score: total,
    ai_feedback: long.feedback,
    status: "graded",
    submitted_at: new Date().toISOString(),
  }).eq("application_id", app.id);

  await svc.from("instructor_applications").update({
    score: total,
    passed,
    status: passed ? "qualified" : "not_qualified",
  }).eq("id", app.id);

  if (passed) {
    await notifyAdmins(
      "Instructor candidate qualified — schedule interview",
      `${profile.full_name ?? profile.email} (code ${app.code}, ${app.subject_name}) scored ${total}% and qualified. Please assign them an interview date in the admin panel.`,
    );
  }

  return NextResponse.json({ total, mcqPct, longPct: long.pct, passed, passMark: PASS_MARK });
}
