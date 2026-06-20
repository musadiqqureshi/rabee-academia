import { sendEmail, notificationEmailHtml } from "@/lib/email";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Creates an in-app notification for a user and emails them a heads-up.
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
    const { data } = await supabase.from("profiles").select("email").eq("id", userId).maybeSingle();
    if (data?.email) {
      await sendEmail({ to: data.email, subject: title, html: notificationEmailHtml(title, body) });
    }
  } catch {
    /* notifications are non-critical */
  }
}
