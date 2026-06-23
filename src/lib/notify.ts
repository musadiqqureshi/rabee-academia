import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { sendNotificationEmails } from "./email";

// A service-role client (bypasses RLS) so we can read recipient emails and write
// notifications for any user. Returns null if the service key isn't configured.
function adminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createAdminClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/**
 * Core dispatch: insert an in-app notification for each user AND email them
 * directly. Rows are written with `emailed: true` so the notifications webhook
 * doesn't email them a second time. Best-effort — never throws.
 */
async function dispatch(userIds: string[], title: string, body: string): Promise<void> {
  const ids = [...new Set(userIds.filter(Boolean))];
  if (ids.length === 0) return;
  const admin = adminClient();
  if (!admin) return;
  try {
    // Send emails first so we know whether to mark rows as emailed.
    const { data: people } = await admin.from("profiles").select("id, email").in("id", ids);
    const emailed = (await sendNotificationEmails(people ?? [], title, body)) > 0;
    await admin
      .from("notifications")
      .insert(ids.map((user_id) => ({ user_id, title, body, emailed })));
  } catch {
    /* notifications are non-critical */
  }
}

/**
 * Creates an in-app notification for a single user and emails them. The
 * `supabase` argument is kept for backwards compatibility but the work is done
 * with the service role so emails can be looked up reliably. Best-effort.
 */
export async function notifyUser(
  _supabase: SupabaseClient,
  userId: string,
  title: string,
  body: string,
): Promise<void> {
  await dispatch([userId], title, body);
}

/**
 * Notify (and email) one or more users via the service role. Used when the
 * caller isn't an admin (e.g. a teacher notifying their students). Best-effort.
 */
export async function notifyMany(userIds: string[], title: string, body: string): Promise<void> {
  await dispatch(userIds, title, body);
}

/**
 * Notify (and email) every admin / super-admin. Used for enrolments and other
 * events the academy team should hear about. Best-effort.
 */
export async function notifyAdmins(title: string, body: string): Promise<void> {
  const admin = adminClient();
  if (!admin) return;
  try {
    const { data } = await admin.from("profiles").select("id").in("role", ["admin", "super_admin"]);
    await dispatch((data ?? []).map((p) => p.id as string), title, body);
  } catch {
    /* non-critical */
  }
}
