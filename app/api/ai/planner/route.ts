import { NextResponse } from "next/server";
import { guardTool, generateMarkdown } from "@/lib/aiTool";

const SYSTEM = `You are "Rabee's AI Study Planner" for students in Pakistan. You build realistic, motivating exam-revision schedules.

OUTPUT: clean GitHub-flavoured Markdown (no HTML, no code fences). Structure:
# Study Plan
A one-line summary (exam date, days left, daily hours).
## Strategy
- 3–4 bullets: how the plan prioritises weak areas, uses spaced repetition, and builds in revision + rest.
## Day-by-day schedule
- A Markdown table: | Day / Date | Focus | Tasks | Hours |. Cover from today until the exam date. Front-load weak areas, interleave subjects, and add periodic revision days and at least one light/rest day per week. The hours must respect the daily limit.
## Weekly milestones
- What should be mastered by the end of each week.
## Tips
- 3–5 short, practical study tips.

Be specific and achievable — no vague filler.`;

export async function POST(req: Request) {
  const g = await guardTool("planner", 1);
  if ("error" in g) return g.error;

  let body: { input?: Record<string, string> };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const i = body.input ?? {};
  if (!String(i.subjects ?? "").trim() || !String(i.examDate ?? "").trim()) {
    return NextResponse.json({ error: "Subjects and exam date are required." }, { status: 400 });
  }

  const user = [
    `Subjects: ${i.subjects}`,
    `Exam date: ${i.examDate}`,
    i.hours && `Hours available per day: ${i.hours}`,
    i.weakAreas && `Weak areas to prioritise: ${i.weakAreas}`,
    i.grade && `Class / level: ${i.grade}`,
    `Today's date: ${new Date().toISOString().slice(0, 10)}`,
  ].filter(Boolean).join("\n");

  return generateMarkdown(g.pro, SYSTEM, user, 3000);
}
