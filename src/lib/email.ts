// Lightweight email sender. Uses Resend if RESEND_API_KEY is configured;
// otherwise it no-ops gracefully (so the app works without email set up).

const FROM = process.env.EMAIL_FROM ?? "Rabee Academia <noreply@rabeeacademia.site>";

export async function sendEmail(opts: { to: string; subject: string; html: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !opts.to) return false;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html }),
      });
      if (res.ok) return true;
      // 429 = rate limited: wait and retry. Other errors: give up.
      if (res.status !== 429) return false;
      await new Promise((r) => setTimeout(r, 1100 * (attempt + 1)));
    } catch {
      return false;
    }
  }
  return false;
}

// Send the branded notification email to a list of recipients. Best-effort:
// each send is independent and failures are swallowed so notifications never
// break the calling code. Returns the number of emails that were accepted.
//
// Resend's free tier allows only 2 requests/second, so we send in small batches
// (2 at a time) with a pause between batches to stay under the rate limit —
// otherwise large broadcasts get rejected after the first couple of emails.
export async function sendNotificationEmails(
  recipients: { email?: string | null }[],
  title: string,
  body: string,
): Promise<number> {
  const html = notificationEmailHtml(title, body);
  const targets = recipients.map((r) => r.email).filter((e): e is string => !!e);
  if (targets.length === 0) return 0;

  const BATCH = 2; // requests per second allowed by Resend's free tier
  const GAP_MS = 1100; // a touch over 1s between batches for safety
  let sent = 0;

  for (let i = 0; i < targets.length; i += BATCH) {
    const batch = targets.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map((to) => sendEmail({ to, subject: title, html }).catch(() => false)),
    );
    sent += results.filter(Boolean).length;
    if (i + BATCH < targets.length) await sleep(GAP_MS);
  }
  return sent;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Branded notification email shell.
export function notificationEmailHtml(title: string, body: string): string {
  const portal = "https://rabeeacademia.site/dashboard";
  return `
  <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a">
    <div style="background:#2563eb;color:#fff;border-radius:14px 14px 0 0;padding:18px 22px;font-weight:700;font-size:18px">Rabee Academia</div>
    <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 14px 14px;padding:22px">
      <h2 style="margin:0 0 8px;font-size:18px">${escapeHtml(title)}</h2>
      <p style="margin:0 0 18px;color:#475569;line-height:1.6">${escapeHtml(body)}</p>
      <a href="${portal}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:600;font-size:14px">Open your portal</a>
      <p style="margin:18px 0 0;color:#94a3b8;font-size:12px">You have a new notification on your Rabee Academia portal. Please log in to check it.</p>
    </div>
  </div>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
