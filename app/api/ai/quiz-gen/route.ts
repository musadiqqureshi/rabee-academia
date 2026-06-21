import { NextResponse } from "next/server";
import { chatComplete } from "@/lib/ai";
import { guardTool, TOOL_MODELS } from "@/lib/aiTool";

const SYSTEM = `You are "Rabee's AI Quiz Maker". Generate a multiple-choice self-test from the student's notes.
Return ONLY valid JSON — no markdown, no code fences, no commentary — exactly this shape:
{"questions":[{"q":"question text","options":["A","B","C","D"],"answer":0,"explanation":"why"}]}
Rules:
- "answer" is the 0-based index (0–3) of the correct option.
- Exactly 4 options per question.
- Keep any mathematics as plain readable text (e.g. v = u + at, H2O), NOT LaTeX.
- Questions must be accurate and appropriate to the level.`;

interface Q { q: string; options: string[]; answer: number; explanation: string }

function extractJson(raw: string): { questions?: unknown } | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try { return JSON.parse(raw.slice(start, end + 1)); } catch { return null; }
}

function sanitize(arr: unknown): Q[] {
  if (!Array.isArray(arr)) return [];
  const out: Q[] = [];
  for (const item of arr) {
    const o = item as Partial<Q>;
    if (!o || typeof o.q !== "string" || !Array.isArray(o.options)) continue;
    const options = o.options.map((x) => String(x)).slice(0, 4);
    if (options.length < 2) continue;
    let answer = Number(o.answer);
    if (!Number.isInteger(answer) || answer < 0 || answer >= options.length) answer = 0;
    out.push({ q: o.q, options, answer, explanation: typeof o.explanation === "string" ? o.explanation : "" });
  }
  return out;
}

export async function POST(req: Request) {
  const g = await guardTool("quiz-gen", 1);
  if ("error" in g) return g.error;

  let body: { input?: Record<string, string> };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const i = body.input ?? {};
  const notes = String(i.notes ?? "").trim();
  if (!notes) return NextResponse.json({ error: "Please paste your notes or a topic." }, { status: 400 });
  const n = Math.min(20, Math.max(3, Number(i.count ?? 5) || 5));

  const user = `Create ${n} multiple-choice questions.\n${i.subject ? `Subject: ${i.subject}\n` : ""}${i.grade ? `Level: ${i.grade}\n` : ""}Notes / topic:\n${notes}`;

  try {
    const raw = await chatComplete(SYSTEM, [{ role: "user", content: user }], { maxTokens: 3000, models: TOOL_MODELS });
    const questions = sanitize(extractJson(raw)?.questions);
    if (!questions.length) {
      return NextResponse.json({ error: "Couldn't build a quiz from that. Try pasting more/clearer notes." }, { status: 502 });
    }
    return NextResponse.json({ questions, pro: g.pro });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Generation failed. Please try again." }, { status: 502 });
  }
}
