import { NextResponse } from "next/server";
import { chatComplete, aiConfigured } from "@/lib/ai";
import { courses, formatPrice } from "@/lib/courses";

// Public site assistant. Restricted to Rabee Academia topics only.
function buildSystem(): string {
  const catalog = courses
    .filter((c) => !c.free)
    .map((c) => `- ${c.name} (${c.level}): ${formatPrice(c.regularPrice)}/month regular, ${formatPrice(c.weekendPrice)}/month weekend`)
    .join("\n");

  return `You are "Rabee's AI", the friendly assistant on the Rabee Academia website (rabeeacademia.site).
ONLY answer questions about Rabee Academia: courses, pricing, enrollment, demo classes, the AI Mastery course, payments, and how the academy works. If asked anything unrelated, politely say you can only help with Rabee Academia and suggest they ask about courses or book a free demo.

Facts:
- Rabee Academia is a premium ONLINE academy for FSc (Pre-Medical & Pre-Engineering), O/A Levels, BS and MS — Physics, Chemistry, Biology, Maths, Computer Science.
- Teaching is ONE-ON-ONE (personal 1:1 live sessions over Google Meet); each student gets their own class link from their teacher.
- Courses & monthly fees (per subject):
${catalog}
- First-course discount: 20% OFF a student's first subject enrollment.
- AI Mastery Course: FREE 2-week weekend intensive, starts July 2026, only 30 seats (group class).
- Free demo: anyone can book a free demo class at /demo (no payment needed).
- How to enroll: create an account → pick a subject on the Pricing page → choose Bank Transfer (Meezan Bank) and upload the payment screenshot, or pay via AssanPay → admin verifies → a teacher is assigned and shares your 1:1 class link.
- Contact: info@rabeeacademia.site

Style: concise and warm. Use short sentences or a few bullet points. Light markdown only. Always nudge toward booking a free demo or enrolling when relevant.`;
}

export async function POST(req: Request) {
  if (!aiConfigured()) {
    return NextResponse.json({ error: "Assistant is offline right now. Please email info@rabeeacademia.site." }, { status: 503 });
  }
  let body: { messages?: { role: "user" | "assistant"; content: string }[] };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  const messages = (body.messages ?? [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-10);
  if (messages.length === 0) return NextResponse.json({ error: "No message" }, { status: 400 });

  try {
    const reply = await chatComplete(buildSystem(), messages, { maxTokens: 1200 });
    return NextResponse.json({ reply });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to reach the assistant." }, { status: 502 });
  }
}
