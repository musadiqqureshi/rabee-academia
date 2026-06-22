import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getProfile } from "@/lib/auth";
import { sendNotificationEmails } from "@/lib/email";

// Super-admin / admin broadcast: insert an in-app notification for every user
// of the chosen role and email each of them. Uses the service role to write
// notifications for other users and read their emails.
export async function POST(req: Request) {
  const caller = await getProfile();
  if (!caller || !["admin", "super_admin"].includes(caller.role)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not set on the server." }, { status: 500 });
  }

  let body: { title?: string; body?: string; recipient_role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const title = (body.title ?? "").trim();
  const message = (body.body ?? "").trim();
  const role = body.recipient_role ?? "student";
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const admin = createAdminClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let query = admin.from("profiles").select("id, email");
  if (role !== "all") query = query.eq("role", role);
  const { data: recipients, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const people = recipients ?? [];

  // Email everyone directly so delivery doesn't depend on the optional webhook.
  const emailedCount = await sendNotificationEmails(people, title, message);
  const emailed = emailedCount > 0;

  // Insert in-app notifications, marked emailed so the webhook won't re-send.
  const rows = people.map((r) => ({ user_id: r.id, title, body: message, emailed }));
  if (rows.length > 0) await admin.from("notifications").insert(rows);

  // Log the broadcast so it shows in the admin "Sent Notifications" history.
  await admin.from("notification_broadcasts").insert({
    title,
    body: message,
    recipient_role: role,
    recipient_count: rows.length,
    sent_by: caller.id,
  });

  return NextResponse.json({ ok: true, count: rows.length, emailed: emailedCount });
}
