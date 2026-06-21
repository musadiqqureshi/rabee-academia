// Provider-agnostic chat completion helper.
//
// Priority:
//  1. OpenAI-compatible provider (OpenRouter / NVIDIA NIM) when AI_BASE_URL +
//     AI_API_KEY are set. Configure with:
//       AI_BASE_URL=https://openrouter.ai/api/v1   (or NVIDIA's)
//       AI_API_KEY=sk-or-...  (or nvapi-...)
//       AI_MODEL=nvidia/nemotron-nano-9b-v2:free
//  2. Anthropic native API when ANTHROPIC_API_KEY is set.
//
// Returns the assistant text, or throws with a friendly message.

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export function aiConfigured(): boolean {
  return Boolean((process.env.AI_BASE_URL && process.env.AI_API_KEY) || process.env.ANTHROPIC_API_KEY);
}

export async function chatComplete(
  system: string,
  messages: ChatMessage[],
  opts: { maxTokens?: number; model?: string; models?: string[] } = {},
): Promise<string> {
  const maxTokens = opts.maxTokens ?? 2000;
  const baseUrl = process.env.AI_BASE_URL;
  const apiKey = process.env.AI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // --- OpenAI-compatible (OpenRouter / NVIDIA NIM) ---
  if (baseUrl && apiKey) {
    // Try each candidate model in order; on a failure (e.g. 429 rate-limit,
    // or an empty reply) fall back to the next one. Per-call list wins, then a
    // single per-call model, then the env model, then a default.
    const candidates =
      opts.models?.length
        ? opts.models
        : [opts.model ?? process.env.AI_MODEL ?? "cohere/north-mini-code:free"];

    let lastErr = "";
    for (const model of candidates) {
      try {
        const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            // OpenRouter attribution headers (ignored by NVIDIA).
            "HTTP-Referer": "https://rabeeacademia.site",
            "X-Title": "Rabee Academia",
          },
          body: JSON.stringify({
            model,
            max_tokens: maxTokens,
            messages: [{ role: "system", content: system }, ...messages],
          }),
        });
        if (!res.ok) {
          const t = await res.text();
          lastErr = `AI provider error (${res.status}): ${t.slice(0, 160)}`;
          continue; // try the next model
        }
        const json = await res.json();
        const msg = json?.choices?.[0]?.message ?? {};
        // Some reasoning models put the answer in `content`; fall back to `reasoning`.
        const text: string = msg.content || msg.reasoning || "";
        if (text) return text.trim();
        lastErr = "AI returned an empty response.";
      } catch (e) {
        lastErr = e instanceof Error ? e.message : "AI request failed.";
      }
    }
    // Every candidate failed. Fall through to Anthropic if available, else throw.
    if (!anthropicKey) {
      throw new Error(lastErr || "All AI models are busy right now. Please try again in a moment.");
    }
  }

  // --- Anthropic native fallback ---
  if (anthropicKey) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL ?? "claude-haiku-4-5",
        max_tokens: maxTokens,
        system,
        messages: messages.filter((m) => m.role !== "system"),
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`AI provider error (${res.status}): ${t.slice(0, 160)}`);
    }
    const json = await res.json();
    const text: string = json?.content?.[0]?.text ?? "";
    if (!text) throw new Error("AI returned an empty response.");
    return text.trim();
  }

  throw new Error("AI is not configured. Set AI_BASE_URL + AI_API_KEY (OpenRouter/NVIDIA) or ANTHROPIC_API_KEY.");
}
