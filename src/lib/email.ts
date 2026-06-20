// Lightweight email sender. Uses Resend if RESEND_API_KEY is configured;
// otherwise it no-ops gracefully (so the app works without email set up).

const FROM = process.env.EMAIL_FROM ?? "Rabee Academia <noreply@rabeeacademia.site>";

export async function sendEmail(opts: { to: string; subject: string; html: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !opts.to) return false;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html }),
    });
    return res.ok;
  } catch {
    return false;
  }
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
