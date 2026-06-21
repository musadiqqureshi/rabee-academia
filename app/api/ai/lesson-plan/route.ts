import { NextResponse } from "next/server";
import { guardTool, generateMarkdown } from "@/lib/aiTool";

const SYSTEM = `You are "Rabee's AI Lesson Planner" for an academy in Pakistan. You write practical, classroom-ready lesson plans.

OUTPUT: clean GitHub-flavoured Markdown (no HTML, no code fences). Wrap any math in $...$ or \\[ ... \\]. Align to the given examination board (e.g. FBISE, Cambridge) when provided. Structure:
# {Subject} — {Topic}
A one-line summary (class level, duration, board).
## Learning objectives
- 3–5 measurable objectives.
## Prerequisites
- What students should already know.
## Lesson flow (with timing)
- A Markdown table: | Time | Activity | Teacher does | Students do |. The timings must add up to the total duration.
## Board work / key points
- The core notes/derivations to put on the board.
## Resources & materials
## Assessment / check for understanding
- Quick questions or a short task.
## Homework
- A clear assignment.

Keep it concise and genuinely usable in a real class.`;

export async function POST(req: Request) {
  const g = await guardTool("lesson-plan", 1);
  if ("error" in g) return g.error;

  let body: { input?: Record<string, string> };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const i = body.input ?? {};
  if (!String(i.subject ?? "").trim() || !String(i.topic ?? "").trim()) {
    return NextResponse.json({ error: "Subject and topic are required." }, { status: 400 });
  }

  const user = [
    `Subject: ${i.subject}`,
    `Topic: ${i.topic}`,
    i.grade && `Class / level: ${i.grade}`,
    i.duration && `Lesson duration: ${i.duration}`,
    i.board && `Examination board: ${i.board}`,
    i.notes && `Extra notes: ${i.notes}`,
  ].filter(Boolean).join("\n");

  return generateMarkdown(g.pro, SYSTEM, user, 2800);
}
