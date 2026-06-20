import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { chatComplete, aiConfigured } from "@/lib/ai";

const SYSTEM = `You are Rabee Academia's AI study assistant for students in Pakistan studying FSc (Pre-Medical & Pre-Engineering), O/A Levels, BS and MS — across Physics, Chemistry, Biology, Mathematics and Computer Science.
Guidelines:
- Teach, don't just give final answers: explain the concept and the steps so the student learns.
- Be concise, clear and encouraging. Use simple language and short worked examples.
- For exam prep, give focused tips and practice suggestions.
- If asked something outside academics, gently steer back to studies.
- Use plain text/markdown; keep math readable.`;

export async function POST(req: Request) {
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  if (!aiConfigured()) {
    return NextResponse.json(
      { error: "AI assistant is not configured yet. Set AI_BASE_URL + AI_API_KEY (OpenRouter/NVIDIA) or ANTHROPIC_API_KEY." },
      { status: 503 },
    );
  }

  let body: { messages?: { role: "user" | "assistant"; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const messages = (body.messages ?? [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12); // keep context bounded
  if (messages.length === 0) return NextResponse.json({ error: "No message" }, { status: 400 });

  try {
    const reply = await chatComplete(SYSTEM, messages, { maxTokens: 2000 });
    return NextResponse.json({ reply });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to reach the AI service." },
      { status: 502 },
    );
  }
}
