import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient as createAdminClient } from "@supabase/supabase-js";

/**
 * Creates an in-app notification for a user. The notification email is sent
 * automatically by the Supabase Database Webhook on `notifications` INSERT
 * (see app/api/hooks/notification), so we only insert the row here — that keeps
 * email handling in one place and avoids duplicate sends.
 * Best-effort: never throws (so it can't break the calling action).
 */
export async function notifyUser(
  supabase: SupabaseClient,
  userId: string,
  title: string,
  body: string,
): Promise<void> {
  try {
    await supabase.from("notifications").insert({ user_id: userId, title, body });
  } catch {
    /* notifications are non-critical */
  }
}

/**
 * Notify one or more users via the service role (bypasses RLS) — used when the
 * caller isn't an admin (e.g. a teacher notifying their students). The webhook
 * then emails each recipient. Best-effort.
 */
export async function notifyMany(userIds: string[], title: string, body: string): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const ids = [...new Set(userIds.filter(Boolean))];
  if (!url || !key || ids.length === 0) return;
  try {
    const admin = createAdminClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
    await admin.from("notifications").insert(ids.map((user_id) => ({ user_id, title, body })));
  } catch {
    /* notifications are non-critical */
  }
}
