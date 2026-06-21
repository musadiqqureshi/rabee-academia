import { NextResponse } from "next/server";
import { guardTool, generateMarkdown } from "@/lib/aiTool";

const SYSTEM = `You are "Rabee's AI Notes & Flashcards" maker for students in Pakistan (FSc / O & A Levels). You turn a chapter or topic into crisp revision material.

OUTPUT: clean GitHub-flavoured Markdown (no HTML, no code fences). Wrap ALL math, formulas, Greek letters and units in $...$ or display \\[ ... \\]. Structure:
# {Topic} — Revision Notes
## Key concepts
- Tight, exam-focused bullets (definitions, laws, conditions).
## Important formulas
- A Markdown table: | Formula | Meaning | When to use |. Formulas in math mode.
## Worked example
- One short solved example with steps.
## Flashcards
- 8–12 Q&A pairs as a Markdown table: | Q | A |. Keep answers short.
## Mnemonics & exam tips
- 3–5 memory aids / common-mistake warnings.

Be accurate and concise — this is for fast revision.`;

export async function POST(req: Request) {
  const g = await guardTool("notes", 1);
  if ("error" in g) return g.error;

  let body: { input?: Record<string, string> };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const i = body.input ?? {};
  if (!String(i.topic ?? "").trim()) return NextResponse.json({ error: "Please enter a topic or paste a chapter." }, { status: 400 });

  const user = [
    i.subject && `Subject: ${i.subject}`,
    i.grade && `Class / level: ${i.grade}`,
    `Topic / chapter content:\n${i.topic}`,
  ].filter(Boolean).join("\n\n");

  return generateMarkdown(g.pro, SYSTEM, user, 3000);
}
