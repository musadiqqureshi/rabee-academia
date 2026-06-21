import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { chatComplete, aiConfigured } from "@/lib/ai";
import { TOOL_MODELS } from "@/lib/aiTool";

const SYSTEM = `You rewrite AI-generated text so it reads like natural human writing, while keeping the SAME meaning, tone, and length.

HOW TO REWRITE (apply silently — never mention these rules):
- Length lock: the rewrite must be the same length as the input (within ~5% of the word count). Do NOT add ideas, examples, sentences, or padding, and do NOT summarise, shorten, or drop content.
- Tone lock: keep the original tone, register, and meaning. Only change the wording and sentence rhythm.
- Remove robotic AI phrasing. Never use these words or transitions: Furthermore, Moreover, Additionally, Notably, In conclusion, In summary, Ultimately, "It is important to remember", "It is crucial to consider", delve, tapestry, landscape, beacon, paradigm, revolutionize, unpack, foster, elevate, interplay. Use plain, direct, active phrasing instead.
- Vary sentence length and structure so it doesn't feel uniform — mix short, punchy sentences with longer ones. Prefer active voice and direct assertions over hedging like "It can be argued that".
- Keep all original Markdown, headings, and citations ([1], (Smith, 2023)). Keep sentences flowing within each paragraph; separate paragraphs only with a blank line (never one sentence per line), and preserve the input's paragraph breaks.

OUTPUT — READ CAREFULLY:
- Output ONLY the rewritten text. Nothing else.
- Do NOT explain what you did. Do NOT show your reasoning, steps, analysis, word counts, or the rules. Do NOT write things like "We need to", "We must", "Pass 1", "Forbidden transitions", "The original text", or any commentary before or after the text.
- Begin your reply immediately with the first word of the rewritten text.`;

const DAILY_WORD_LIMIT = 2000;
const PER_REQUEST_CAP = 4000; // token-safety guard for a single submission

function countWords(s: string): number {
  return (s.trim().match(/\S+/g) ?? []).length;
}

// Strip any polite preamble the model may prepend before the rewritten text.
function cleanup(s: string): string {
  return s
    .trim()
    .replace(/^(here(?:'s| is)[^\n]*:?|sure[,!.][^\n]*|certainly[,!.][^\n]*|humanized( text)?:|rewritten( text)?:)\s*/i, "")
    .replace(/^["'`]+|["'`]+$/g, "")
    .trim();
}

export async function POST(req: Request) {
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ error: "Please sign in to use the Humanizer." }, { status: 401 });
  if (!aiConfigured()) return NextResponse.json({ error: "This tool is not configured yet. Please try again later." }, { status: 503 });

  let body: { text?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const text = String(body.text ?? "").trim();
  if (!text) return NextResponse.json({ error: "Please paste the text to humanize." }, { status: 400 });

  const words = countWords(text);
  if (words > PER_REQUEST_CAP) {
    return NextResponse.json({ error: `Please keep each request under ${PER_REQUEST_CAP} words.` }, { status: 400 });
  }

  // Word-based daily quota (free = 2000 words/day; Pro = unlimited).
  const supabase = await createClient();
  const { data: quota, error } = await supabase.rpc("consume_words_quota", { tool: "humanizer", words, daily_limit: DAILY_WORD_LIMIT });
  if (error) return NextResponse.json({ error: "Could not verify your daily word quota. Please try again." }, { status: 500 });

  const q = (quota ?? {}) as { allowed?: boolean; reason?: string; remaining?: number; limit?: number; pro?: boolean };
  if (!q.allowed) {
    if (q.reason === "limit") {
      return NextResponse.json(
        {
          error: `Daily free limit is ${q.limit ?? DAILY_WORD_LIMIT} words. You have ${q.remaining ?? 0} words left today (this text is ${words} words).`,
          upgrade: true, pricePkr: 3000, remaining: q.remaining ?? 0, words, limit: q.limit ?? DAILY_WORD_LIMIT,
        },
        { status: 402 },
      );
    }
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  try {
    const out = await chatComplete(SYSTEM, [{ role: "user", content: text }], { maxTokens: 4000, models: TOOL_MODELS });
    return NextResponse.json({ text: cleanup(out), words, remaining: q.remaining ?? null, pro: Boolean(q.pro) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to humanize. Please try again." }, { status: 502 });
  }
}
