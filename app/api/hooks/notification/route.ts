import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { sendEmail, notificationEmailHtml } from "@/lib/email";

// Supabase Database Webhook receiver: fires on every INSERT into the
// `notifications` table and emails the recipient. This guarantees an email for
// EVERY notification, no matter where in the app it was created.
//
// Protect it with a shared secret: set NOTIFY_WEBHOOK_SECRET and add the header
//   x-webhook-secret: <that value>
// to the Supabase webhook configuration.
export async function POST(req: Request) {
  const secret = process.env.NOTIFY_WEBHOOK_SECRET;
  if (secret && req.headers.get("x-webhook-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: { type?: string; record?: Record<string, unknown>; new?: Record<string, unknown> };
  try { payload = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  // Supabase sends { type, table, record, old_record }. Tolerate `new` too.
  const record = (payload.record ?? payload.new ?? null) as
    | { user_id?: string; title?: string; body?: string | null; emailed?: boolean }
    | null;
  if (!record?.user_id) return NextResponse.json({ ok: true, skipped: true });

  // The app already emails most notifications inline (and marks them emailed).
  // Only handle rows that haven't been emailed yet (e.g. DB-trigger inserts).
  if (record.emailed) return NextResponse.json({ ok: true, alreadyEmailed: true });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const admin = createAdminClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: profile } = await admin.from("profiles").select("email").eq("id", record.user_id).maybeSingle();
  const to = profile?.email as string | undefined;
  if (!to) return NextResponse.json({ ok: true, noEmail: true });

  const title = record.title || "New notification";
  const body = record.body || "You have a new notification on your Rabee Academia portal. Please log in to check it.";
  const ok = await sendEmail({ to, subject: title, html: notificationEmailHtml(title, body) });
  return NextResponse.json({ ok });
}
