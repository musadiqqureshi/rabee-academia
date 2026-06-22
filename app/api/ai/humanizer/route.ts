import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { chatComplete, aiConfigured } from "@/lib/ai";

// The Humanizer needs a non-reasoning, instruction-following model (reasoning
// models "think out loud" and leak their analysis). It therefore uses its own
// model list, independent of AI_MODEL. Override with AI_HUMANIZER_MODEL
// (comma-separated = fallback chain on 429/failure).
const HUMANIZER_MODELS = process.env.AI_HUMANIZER_MODEL
  ? process.env.AI_HUMANIZER_MODEL.split(",").map((s) => s.trim()).filter(Boolean)
  : [
      "meta-llama/llama-3.3-70b-instruct:free",
      "google/gemini-2.0-flash-exp:free",
      "mistralai/mistral-nemo:free",
    ];

const SYSTEM = `You rewrite AI-generated text so it reads like natural human writing, keeping the SAME meaning, tone, and length.

Apply these silently (never mention them):
- LENGTH: the rewrite must match the input's length — about the same word count, and NEVER longer than the input. Do NOT add ideas, examples, sentences, or padding. Do NOT summarise or drop content. If unsure, keep it the same length rather than longer.
- TONE: preserve the original tone, register, and meaning. Change only the wording and sentence rhythm.
- Remove robotic AI phrasing. Never use: Furthermore, Moreover, Additionally, Notably, In conclusion, In summary, Ultimately, "It is important to remember", "It is crucial to consider", delve, tapestry, landscape, beacon, paradigm, revolutionize, unpack, foster, elevate, interplay. Use plain, direct, active phrasing.
- Vary sentence length naturally (mix short and long); prefer active voice and direct assertions over hedging like "It can be argued that".
- Keep all original Markdown, headings, and citations ([1], (Smith, 2023)). Keep sentences flowing within paragraphs; separate paragraphs only with a blank line (never one sentence per line); preserve the input's paragraph breaks.

OUTPUT FORMAT — follow EXACTLY:
- Do any thinking silently. Output ONLY the final rewritten text, wrapped between the markers <<<OUTPUT>>> and <<<END>>>, with nothing else inside or outside the markers.
- Do NOT write any reasoning, analysis, steps, word counts, or notes anywhere.
Example:
<<<OUTPUT>>>
the rewritten text here
<<<END>>>`;

const DAILY_WORD_LIMIT = 2000;
const PER_REQUEST_CAP = 4000; // token-safety guard for a single submission

function countWords(s: string): number {
  return (s.trim().match(/\S+/g) ?? []).length;
}

// Pull only the final text out of the model reply, hiding any reasoning the
// model may have produced before the <<<OUTPUT>>> marker.
function extractOutput(raw: string): string {
  const start = raw.indexOf("<<<OUTPUT>>>");
  const end = raw.indexOf("<<<END>>>");
  let out = raw;
  if (start !== -1) {
    out = end !== -1 && end > start ? raw.slice(start + 11, end) : raw.slice(start + 11);
  }
  return out
    .trim()
    .replace(/<<<\/?(OUTPUT|END)>>>/g, "")
    .replace(/^(here(?:'s| is)[^\n]*:?|sure[,!.][^\n]*|humanized( text)?:|rewritten( text)?:)\s*/i, "")
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

  // Give enough room to finish (a too-tight cap truncates the answer). Length
  // is controlled by the prompt + the retry below, not by starving the budget.
  const maxTokens = Math.min(4000, Math.max(800, Math.round(words * 4) + 400));

  try {
    const raw = await chatComplete(SYSTEM, [{ role: "user", content: text }], { maxTokens, models: HUMANIZER_MODELS });
    let out = extractOutput(raw);

    // If the rewrite came back noticeably longer than the input, ask once more
    // to bring it back to the original length.
    if (countWords(out) > words * 1.25) {
      const raw2 = await chatComplete(
        `${SYSTEM}\n\nIMPORTANT: your previous rewrite was too long. The rewrite MUST be no longer than the original (about ${words} words).`,
        [{ role: "user", content: text }],
        { maxTokens, models: HUMANIZER_MODELS },
      );
      const out2 = extractOutput(raw2);
      if (out2 && countWords(out2) < countWords(out)) out = out2;
    }

    if (!out) return NextResponse.json({ error: "Could not humanize that text. Please try again." }, { status: 502 });
    return NextResponse.json({ text: out, words, remaining: q.remaining ?? null, pro: Boolean(q.pro) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to humanize. Please try again." }, { status: 502 });
  }
}
