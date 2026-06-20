import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { chatComplete, aiConfigured } from "@/lib/ai";

const SYSTEM = `You are "Rabee's AI", the study assistant for Rabee Academia — an online academy in Pakistan for FSc (Pre-Medical & Pre-Engineering), O/A Levels, BS and MS, across Physics, Chemistry, Biology, Mathematics and Computer Science.
Guidelines:
- Teach, don't just give final answers: explain the concept and steps simply.
- Keep answers SHORT and easy to read. Prefer 2-5 short bullet points or a few sentences over long essays.
- Use light markdown only (a heading, **bold** key terms, bullet/numbered lists). Do NOT overuse markdown or write walls of text.
- Be encouraging and use simple language with one short example when helpful.
- If asked something unrelated to studies or this academy, gently steer back.`;

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
