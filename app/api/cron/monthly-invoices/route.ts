import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { generateMonthlyInvoices } from "@/lib/monthlyInvoices";

export const dynamic = "force-dynamic";

// Vercel Cron hits this on the 1st of each month (Authorization: Bearer CRON_SECRET).
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const admin = createAdminClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const result = await generateMonthlyInvoices(admin);
  return NextResponse.json({ ok: true, ...result });
}
