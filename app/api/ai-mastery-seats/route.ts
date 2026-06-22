import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCourse } from "@/lib/courses";

export const dynamic = "force-dynamic";

// Public live seat count for the AI Mastery course.
export async function GET() {
  const limit = getCourse("ai-mastery")?.seatLimit ?? 30;
  try {
    const supabase = await createClient();
    const { data } = await supabase.rpc("ai_mastery_seats");
    const taken = Number(data ?? 0);
    return NextResponse.json({ taken, limit, left: Math.max(0, limit - taken) });
  } catch {
    return NextResponse.json({ taken: 0, limit, left: limit });
  }
}
