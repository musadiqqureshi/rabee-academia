import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { chatComplete, aiConfigured } from "@/lib/ai";
import { TOOL_MODELS } from "@/lib/aiTool";

// "Rabee's AI Paper Maker" — generates an exam paper + answer key. We render
// with KaTeX + browser print (not a LaTeX toolchain), so the model returns
// GitHub-flavoured markdown with math in $...$ / \[ ... \], split into two
// clearly delimited blocks for easy programmatic separation.
const SYSTEM = `You are "Rabee's AI Paper Maker", an expert exam-paper generator for an academy in Pakistan. You produce clean, professionally structured examination papers.

OUTPUT FORMAT — follow EXACTLY:
- Output TWO blocks and nothing else (no commentary, no code fences):
  <<<PAPER>>>
  ...the question sections in GitHub-flavoured Markdown...
  <<<KEY>>>
  ...the complete answer key in Markdown...
- NEVER write the word "latex", use code fences, raw HTML tags (<div>, <center>, <span>) or template placeholders like {{...}}.
- The app renders the school header, exam/time/marks table, student-info table and the "end of paper" line ITSELF — DO NOT output any of those. Start at "## Instructions".
- NEVER leave blank space or underscores for students to write answers.

MATH (critical): wrap ALL mathematics in single dollars $...$ inline, or \\[ ... \\] for display. Never write raw symbols, fractions, superscripts, subscripts, Greek letters or units in plain text — e.g. $F = ma$, $\\frac{1}{2}mv^2$, $\\theta$, $9.8\\,\\text{m/s}^2$.

THE PAPER BLOCK MUST CONTAIN, IN THIS ORDER:

## Instructions
1. A numbered list of 3–4 short exam rules (e.g. attempt all questions, all questions compulsory).

Then ONLY the sections that match the requested question types, each as a SINGLE Markdown table:

# SECTION A — MULTIPLE CHOICE QUESTIONS (<section marks> Marks)
A single table with EXACTLY these columns and one row per MCQ, numbered from 1:
| # | Question | Option A | Option B | Option C | Option D |
Keep each option short. Do not reveal the answer here.

# SECTION B — SHORT QUESTIONS (<section marks> Marks)
A single table with EXACTLY these columns, numbering continuing after Section A:
| Q. No. | Question | Marks |

# SECTION C — LONG QUESTIONS (<section marks> Marks)
A single table with EXACTLY these columns, numbering continuing:
| Q. No. | Question | Marks |

RULES:
- Number questions continuously across all sections (MCQs 1..n, then short, then long).
- Put the marks for each section in its heading, and the sum of ALL marks MUST equal the requested total marks.
- If the language is Urdu, write the questions in Urdu (keep math in math mode).

KEY BLOCK:
- Title it "# Answer Key".
- MCQs: list "Q1 → C" mappings. Short: the correct answer. Long: concise key points / marking scheme.

Be accurate and aligned to the requested grade level.`;

function specToPrompt(s: Record<string, unknown>): string {
  const g = (k: string) => (typeof s[k] === "string" ? (s[k] as string).trim() : s[k] ?? "");
  const lines = [
    `Subject: ${g("subject")}`,
    `Grade / class level: ${g("grade")}`,
    `Topic(s): ${g("topics")}`,
    `Number of questions: ${g("count")}`,
    `Difficulty: ${g("difficulty")}`,
    `Total marks: ${g("totalMarks")}`,
    `Question types & counts: ${g("questionTypes")}`,
    `Language: ${g("language")}`,
  ];
  if (g("institution")) lines.push(`Institution name: ${g("institution")}`);
  if (g("examTitle")) lines.push(`Exam title: ${g("examTitle")}`);
  if (g("timeAllowed")) lines.push(`Time allowed: ${g("timeAllowed")}`);
  if (g("notes")) lines.push(`Additional notes: ${g("notes")}`);
  return `Generate an exam paper with these specifications:\n${lines.join("\n")}`;
}

const REQUIRED = ["subject", "grade", "topics", "count", "difficulty", "totalMarks", "questionTypes", "language"];

export async function POST(req: Request) {
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ error: "Please sign in to use the Paper Maker." }, { status: 401 });

  if (!aiConfigured()) {
    return NextResponse.json({ error: "The Paper Maker is not configured yet. Please try again later." }, { status: 503 });
  }

  let body: { spec?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const spec = body.spec ?? {};
  const missing = REQUIRED.filter((k) => !String(spec[k] ?? "").trim());
  if (missing.length) {
    return NextResponse.json({ error: `Missing required fields: ${missing.join(", ")}` }, { status: 400 });
  }

  // Daily quota (free = 1/day, Pro = unlimited) — atomic check + increment.
  const supabase = await createClient();
  const { data: quota, error: quotaErr } = await supabase.rpc("consume_paper_quota", { daily_limit: 1 });
  if (quotaErr) {
    return NextResponse.json({ error: "Could not verify your daily quota. Please try again." }, { status: 500 });
  }
  const q = (quota ?? {}) as { allowed?: boolean; reason?: string; pro?: boolean };
  if (!q.allowed) {
    if (q.reason === "limit") {
      return NextResponse.json(
        { error: "You've used today's free paper. Upgrade to Pro for unlimited papers.", upgrade: true, pricePkr: 3000 },
        { status: 402 },
      );
    }
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  try {
    const raw = await chatComplete(SYSTEM, [{ role: "user", content: specToPrompt(spec) }], { maxTokens: 4000, models: TOOL_MODELS });
    // Split the two delimited blocks; tolerate a missing key block.
    const paperIdx = raw.indexOf("<<<PAPER>>>");
    const keyIdx = raw.indexOf("<<<KEY>>>");
    let paper = raw;
    let key = "";
    if (keyIdx !== -1) {
      paper = raw.slice(paperIdx !== -1 ? paperIdx + "<<<PAPER>>>".length : 0, keyIdx);
      key = raw.slice(keyIdx + "<<<KEY>>>".length);
    } else if (paperIdx !== -1) {
      paper = raw.slice(paperIdx + "<<<PAPER>>>".length);
    }
    return NextResponse.json({ paper: paper.trim(), key: key.trim(), pro: Boolean(q.pro) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to generate the paper. Please try again." },
      { status: 502 },
    );
  }
}
