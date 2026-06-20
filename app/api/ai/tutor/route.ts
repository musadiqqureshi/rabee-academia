import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";

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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI assistant is not configured yet (missing ANTHROPIC_API_KEY)." },
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
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 1024,
        system: SYSTEM,
        messages,
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ error: `AI error (${res.status})`, detail: t.slice(0, 200) }, { status: 502 });
    }
    const json = await res.json();
    const reply: string = json?.content?.[0]?.text ?? "Sorry, I couldn't generate a response.";
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "Failed to reach the AI service." }, { status: 502 });
  }
}
