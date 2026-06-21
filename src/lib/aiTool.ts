import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { aiConfigured, chatComplete } from "@/lib/ai";

// Models used by all Rabee's AI tools (Paper Maker, Essay Grader, Lesson Plan,
// Notes, Planner, Quiz). Independent of the dashboard's AI_MODEL.
// AI_TOOLS_MODEL may be a comma-separated list — they're tried in order, so if
// the first (free) model is rate-limited (429) we fall back to the next.
const DEFAULT_TOOL_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemini-2.0-flash-exp:free",
  "qwen/qwen-2.5-72b-instruct:free",
  "mistralai/mistral-nemo:free",
];

export const TOOL_MODELS = (process.env.AI_TOOLS_MODEL
  ? process.env.AI_TOOLS_MODEL.split(",").map((s) => s.trim()).filter(Boolean)
  : DEFAULT_TOOL_MODELS);

// First choice (kept for any single-model callers).
export const TOOL_MODEL = TOOL_MODELS[0];

type GuardResult = { error: NextResponse } | { ok: true; pro: boolean };

// Shared gate for every AI tool route: requires auth + configured AI, then
// atomically consumes one daily use for the given tool (Pro users bypass).
export async function guardTool(tool: string, dailyLimit = 1): Promise<GuardResult> {
  const profile = await getProfile();
  if (!profile) {
    return { error: NextResponse.json({ error: "Please sign in to use this tool." }, { status: 401 }) };
  }
  if (!aiConfigured()) {
    return { error: NextResponse.json({ error: "This tool is not configured yet. Please try again later." }, { status: 503 }) };
  }

  const supabase = await createClient();
  const { data: quota, error } = await supabase.rpc("consume_tool_quota", { tool, daily_limit: dailyLimit });
  if (error) {
    return { error: NextResponse.json({ error: "Could not verify your daily quota. Please try again." }, { status: 500 }) };
  }
  const q = (quota ?? {}) as { allowed?: boolean; reason?: string; pro?: boolean };
  if (!q.allowed) {
    if (q.reason === "limit") {
      return {
        error: NextResponse.json(
          { error: "You've used today's free generation for this tool. Upgrade to Pro for unlimited.", upgrade: true, pricePkr: 3000 },
          { status: 402 },
        ),
      };
    }
    return { error: NextResponse.json({ error: "Not allowed." }, { status: 403 }) };
  }
  return { ok: true, pro: Boolean(q.pro) };
}

// Runs the model and wraps the markdown result (used by the markdown-output
// tools). Keeps each route to just a prompt + field parsing.
export async function generateMarkdown(pro: boolean, system: string, user: string, maxTokens = 2500) {
  try {
    const text = await chatComplete(system, [{ role: "user", content: user }], { maxTokens, models: TOOL_MODELS });
    return NextResponse.json({ text, pro });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Generation failed. Please try again." }, { status: 502 });
  }
}
