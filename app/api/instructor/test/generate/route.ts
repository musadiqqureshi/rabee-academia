import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { chatComplete, aiConfigured } from "@/lib/ai";
import { TOOL_MODELS } from "@/lib/aiTool";
import { MCQ_COUNT, LONG_COUNT, type FullTest, type PublicTest } from "@/lib/instructor";

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createAdminClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function extractJson(raw: string): { mcqs?: unknown; long?: unknown } | null {
  const s = raw.replace(/```(?:json)?/gi, "");
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try { return JSON.parse(s.slice(start, end + 1)); } catch { return null; }
}

function sanitize(parsed: { mcqs?: unknown; long?: unknown } | null): FullTest | null {
  if (!parsed) return null;
  const mcqs: FullTest["mcqs"] = [];
  if (Array.isArray(parsed.mcqs)) {
    for (const item of parsed.mcqs) {
      const o = item as { q?: unknown; options?: unknown; answer?: unknown; explanation?: unknown };
      if (typeof o.q !== "string" || !Array.isArray(o.options)) continue;
      const options = o.options.map(String).slice(0, 4);
      if (options.length < 2) continue;
      let answer = Number(o.answer);
      if (!Number.isInteger(answer) || answer < 0 || answer >= options.length) answer = 0;
      mcqs.push({ q: o.q, options, answer, explanation: typeof o.explanation === "string" ? o.explanation : "" });
    }
  }
  const long: FullTest["long"] = [];
  if (Array.isArray(parsed.long)) {
    for (const item of parsed.long) {
      const o = item as { prompt?: unknown };
      const prompt = typeof o === "string" ? o : typeof o?.prompt === "string" ? o.prompt : "";
      if (prompt) long.push({ prompt });
    }
  }
  if (mcqs.length < 3 || long.length < 1) return null;
  return { mcqs: mcqs.slice(0, MCQ_COUNT), long: long.slice(0, LONG_COUNT) };
}

const strip = (t: FullTest): PublicTest => ({
  mcqs: t.mcqs.map((m) => ({ q: m.q, options: m.options })),
  long: t.long.map((l) => ({ prompt: l.prompt })),
});

export async function POST() {
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (!aiConfigured()) return NextResponse.json({ error: "The test service isn't available right now." }, { status: 503 });

  const supabase = await createClient();
  const { data: app } = await supabase
    .from("instructor_applications")
    .select("id, subject_name, status")
    .eq("user_id", profile.id).maybeSingle();
  if (!app) return NextResponse.json({ error: "No application found." }, { status: 404 });
  if (app.status === "test_submitted" || app.status === "qualified" || app.status === "not_qualified" || app.status === "interview_scheduled" || app.status === "hired")
    return NextResponse.json({ error: "You have already taken the test." }, { status: 409 });
  if (app.status !== "test_unlocked")
    return NextResponse.json({ error: "Your test isn't unlocked yet. An admin must verify your fee first." }, { status: 403 });

  const svc = admin();
  if (!svc) return NextResponse.json({ error: "Server not configured." }, { status: 503 });

  // Reuse an existing un-submitted test so a refresh doesn't regenerate it.
  const { data: existing } = await svc
    .from("instructor_tests").select("questions, status").eq("application_id", app.id).maybeSingle();
  if (existing && existing.status === "generated") {
    return NextResponse.json({ test: strip(existing.questions as FullTest) });
  }

  const system = `You are setting a HARD screening exam for a prospective ${app.subject_name} teacher at a premium academy. The exam must be genuinely difficult and discriminating — university/advanced level, testing deep conceptual mastery and problem solving, NOT trivia or definitions.
Return ONLY valid JSON (no markdown, no fences) of exactly this shape:
{"mcqs":[{"q":"...","options":["A","B","C","D"],"answer":0,"explanation":"..."}],"long":[{"prompt":"..."}]}
Rules:
- Exactly ${MCQ_COUNT} MCQs, each with exactly 4 options and "answer" as the 0-based index of the correct option.
- Make MCQs hard: multi-step reasoning, common misconceptions as distractors.
- Then exactly ${LONG_COUNT} long-answer questions that probe conceptual depth AND teaching ability (e.g. "explain X to a student and address the common misconception Y").
- Keep mathematics as plain readable text (e.g. v = u + at), NOT LaTeX.`;

  let test: FullTest | null = null;
  try {
    const raw = await chatComplete(system, [{ role: "user", content: `Subject: ${app.subject_name}. Generate the hard screening exam now.` }], { maxTokens: 4000, models: TOOL_MODELS });
    test = sanitize(extractJson(raw));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not generate the test." }, { status: 502 });
  }
  if (!test) return NextResponse.json({ error: "The test generator returned an unexpected response. Please try again." }, { status: 502 });

  // Store the FULL test (with answers) via the service role — the candidate's
  // RLS forbids reading this row, so the key never reaches the browser.
  const { error: upErr } = await svc
    .from("instructor_tests")
    .upsert({ application_id: app.id, questions: test, status: "generated" }, { onConflict: "application_id" });
  if (upErr) return NextResponse.json({ error: "Could not start the test. Please try again." }, { status: 500 });

  return NextResponse.json({ test: strip(test) });
}
