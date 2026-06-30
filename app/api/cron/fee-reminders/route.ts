import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { notifyUser } from "@/lib/notify";

export const dynamic = "force-dynamic";

// Vercel Cron hits this on the 3rd & 5th — reminds students of unpaid monthly fees.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const admin = createAdminClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const { data: invoices } = await admin
    .from("invoices")
    .select("student_id, amount_pkr")
    .eq("category", "monthly_fee")
    .in("status", ["issued", "overdue"])
    .gte("issued_at", monthStart);

  // Sum any unpaid amounts per student, then send one reminder each.
  const dueByStudent = new Map<string, number>();
  for (const i of invoices ?? []) {
    dueByStudent.set(i.student_id as string, (dueByStudent.get(i.student_id as string) ?? 0) + (i.amount_pkr as number));
  }

  let sent = 0;
  for (const [studentId, amount] of dueByStudent) {
    await notifyUser(
      admin as never, studentId,
      "Monthly fee reminder",
      `Your monthly fee of PKR ${amount.toLocaleString("en-PK")} is due by the 5th. Please submit your payment to avoid interruption. You can pay via the Invoices section of your dashboard.`,
    ).catch(() => {});
    sent++;
  }
  return NextResponse.json({ ok: true, reminded: sent });
}
