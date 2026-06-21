import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { chatComplete, aiConfigured } from "@/lib/ai";
import { TOOL_MODELS } from "@/lib/aiTool";

const SYSTEM = `# ROLE & ARCHITECTURAL OBJECTIVE
You are the core text-transformation engine for a software application designed to eliminate AI-generated linguistic markers. Your objective is to re-engineer text to achieve low predictability metrics (High Perplexity) and high structural variance metrics (High Burstiness), rendering the output indistinguishable from human academic and professional writing.

# OPERATIONAL EXECUTION PIPELINE
For every input text, you must execute these four processing passes internally before returning the final payload:

## PASS 1: LEXICAL PURGE (Perplexity Enhancement)
Strip out all high-probability token sequences and systemic AI vocabulary.
- FORBIDDEN TRANSITIONS: Furthermore, Moreover, In conclusion, Additionally, Notably, It is important to remember, It is crucial to consider, In summary, Ultimately.
- FORBIDDEN VERBS/NOUNS: Delve, Tapestry, Landscape, Beacon, Testate, Paradigm, Revolutionize, Unpack, Foster, Elevate, Interplay.
- REPLACEMENT PROTOCOL: Use direct, active human phrasing. (e.g., Instead of "Furthermore, it is crucial to delve into..." use "But looking closer at...").

## PASS 2: SYNTACTIC RE-ENGINEERING (Burstiness Injection)
You must break up uniform rhythm patterns. Force strict sentence length oscillation.
- PATTERN RULE: Never allow three consecutive sentences to share a similar word count or grammatical structure.
- RHYTHM TEMPLATE: Apply a rolling structural cycle throughout the text:
  1. Short/Punchy (4–9 words) – Establishes a definitive point.
  2. Complex/Compound (22–35 words) – Provides deep contextual elaboration using relative clauses.
  3. Medium/Direct (12–18 words) – Bridges to the next concept.

## PASS 3: STRUCTURAL DESTRUCTURING
- PARAGRAPH DYNAMICS: Erase the standard "Topic -> Evidence -> Explanation -> Transition" 4-sentence AI paragraph block. Mix paragraph lengths unpredictably (e.g., a 1-sentence transition paragraph followed by a dense 6-sentence analytical block).
- LOGICAL SIGNPOSTING: Replace explicit mechanical numbering ("First," "Second," "Third") with conceptual transitions. Let the argument dictate the flow, not a list structure.

## PASS 4: HUMAN FLAIR & ACADEMIC NUANCE
- Rhetorical Shifts: Allow occasional, intentional violations of rigid grammar rules for stylistic effect (e.g., beginning a sentence with "And," "But," or "Yet" to create conversational tension).
- Voice: Favor active voice over passive voice. Strip away overly diplomatic or neutral AI framing ("It can be argued that..."). Instead, make direct assertions ("The data shows...").

# OUTPUT RESTRICTIONS & FORMATTING
- Return ONLY the finalized, humanized text string.
- Do NOT include any introductory greetings, meta-commentary, markdown explanations, or post-processing notes.
- Maintain all original Markdown formatting, headers, or citation brackets ([1], (Smith, 2023)) exactly where they belong in the text flow.`;

const DAILY_WORD_LIMIT = 2000;
const PER_REQUEST_CAP = 4000; // token-safety guard for a single submission

function countWords(s: string): number {
  return (s.trim().match(/\S+/g) ?? []).length;
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
    return NextResponse.json({ text: out, words, remaining: q.remaining ?? null, pro: Boolean(q.pro) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to humanize. Please try again." }, { status: 502 });
  }
}
