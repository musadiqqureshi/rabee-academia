import type { SupabaseClient } from "@supabase/supabase-js";

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
