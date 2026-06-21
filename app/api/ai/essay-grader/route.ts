import { NextResponse } from "next/server";
import { guardTool, generateMarkdown } from "@/lib/aiTool";

const SYSTEM = `You are "Rabee's AI Essay Grader", a fair, experienced examiner for an academy in Pakistan (FSc / O & A Levels). You grade free-text answers against a marking scheme and give constructive feedback.

OUTPUT: clean GitHub-flavoured Markdown (no HTML, no code fences). Wrap all math in $...$ or \\[ ... \\]. Structure:
## Result
- A bold awarded score like **Score: 7 / 10**.
## Criterion breakdown
- A Markdown table: | Criterion | Marks | Awarded | Comment |. If no rubric is given, infer sensible criteria (content, accuracy, structure, language).
## What was good
- 2–4 short bullets.
## How to improve
- 3–5 specific, actionable bullets tied to the marking scheme.
## Model points
- Brief list of the key points a full-mark answer should contain.

Be objective and encouraging; never inflate marks.`;

export async function POST(req: Request) {
  const g = await guardTool("essay-grader", 1);
  if ("error" in g) return g.error;

  let body: { input?: Record<string, string> };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const i = body.input ?? {};
  const answer = String(i.answer ?? "").trim();
  if (!answer) return NextResponse.json({ error: "Please paste the student's answer." }, { status: 400 });

  const user = [
    i.subject && `Subject: ${i.subject}`,
    i.grade && `Class / level: ${i.grade}`,
    i.totalMarks && `Total marks: ${i.totalMarks}`,
    i.question && `Question / prompt:\n${i.question}`,
    i.scheme && `Marking scheme / rubric:\n${i.scheme}`,
    `Student's answer:\n${answer}`,
  ].filter(Boolean).join("\n\n");

  return generateMarkdown(g.pro, SYSTEM, user, 2500);
}
