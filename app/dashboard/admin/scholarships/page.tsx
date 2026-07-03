import { HeartHandshake, FileText, CheckCircle2 } from "lucide-react";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { approveScholarship, rejectScholarship, waitlistScholarship } from "./actions";

export const dynamic = "force-dynamic";
const fmt = (n: number | null) => (n ? "PKR " + n.toLocaleString("en-PK") : "—");

const STATUS_STYLE: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-700",
  under_review: "bg-blue-100 text-blue-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  waitlisted: "bg-amber-100 text-amber-700",
};

interface Row {
  id: string; full_name: string; email: string; phone: string | null; subject_name: string | null;
  monthly_income: number | null; household_size: number | null; reason: string | null; document_url: string | null;
  status: string; awarded_amount: number | null; valid_until: string | null; created_at: string;
}

export default async function AdminScholarships() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data } = await supabase.from("scholarship_applications").select("*").order("created_at", { ascending: false });
  const rows = (data ?? []) as Row[];

  // Sign document URLs (private bucket) with the service role.
  const docs = new Map<string, string>();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    const admin = createAdminClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
    for (const r of rows) {
      if (!r.document_url) continue;
      const { data: signed } = await admin.storage.from("scholarship-docs").createSignedUrl(r.document_url, 3600);
      if (signed?.signedUrl) docs.set(r.id, signed.signedUrl);
    }
  }

  const input = "rounded-lg border border-input bg-background px-2 py-1.5 text-xs";

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><HeartHandshake className="w-6 h-6 text-primary" /> Scholarship Applications</h1>
        <p className="text-sm text-muted-foreground mt-1">Review need-based applications and grant a monthly fee reduction. Approvals apply automatically to the student&apos;s invoices.</p>
      </div>

      {rows.length === 0 ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <HeartHandshake className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No applications yet</p>
          <p className="text-sm text-muted-foreground mt-1">Applications appear here once students apply on the scholarships page.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {rows.map((r) => (
            <div key={r.id} className="rounded-2xl border border-card-border bg-card shadow-sm p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold">{r.full_name}</p>
                  <p className="text-xs text-muted-foreground">{r.email}{r.phone ? ` · ${r.phone}` : ""}{r.subject_name ? ` · needs aid for ${r.subject_name}` : ""}</p>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${STATUS_STYLE[r.status] ?? "bg-muted"}`}>{r.status.replace("_", " ")}{r.status === "approved" && r.awarded_amount ? ` · ${fmt(r.awarded_amount)}` : ""}</span>
              </div>

              <div className="grid sm:grid-cols-3 gap-2 text-xs mb-3">
                <p><span className="text-muted-foreground">Monthly income:</span> {fmt(r.monthly_income)}</p>
                <p><span className="text-muted-foreground">Household size:</span> {r.household_size ?? "—"}</p>
                {docs.has(r.id)
                  ? <a href={docs.get(r.id)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline"><FileText className="w-3.5 h-3.5" /> View document</a>
                  : <span className="text-muted-foreground">No document</span>}
              </div>
              {r.reason && <p className="text-xs text-foreground/80 border-l-2 border-border pl-3 mb-3 whitespace-pre-wrap">{r.reason}</p>}

              {r.status !== "approved" && r.status !== "rejected" && (
                <div className="flex flex-wrap items-end gap-3 pt-1">
                  <form action={approveScholarship} className="flex items-end gap-2">
                    <input type="hidden" name="id" value={r.id} />
                    <div><label className="block text-[10px] text-muted-foreground mb-1">Amount off / month (PKR)</label><input name="awarded_amount" type="number" min={1} required className={`${input} w-32`} /></div>
                    <div><label className="block text-[10px] text-muted-foreground mb-1">Valid until (optional)</label><input name="valid_until" type="date" className={input} /></div>
                    <button className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:opacity-90 inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Approve</button>
                  </form>
                  <form action={waitlistScholarship}><input type="hidden" name="id" value={r.id} />
                    <button className="px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted">Waitlist</button>
                  </form>
                  <form action={rejectScholarship} className="flex items-end gap-1.5"><input type="hidden" name="id" value={r.id} />
                    <input name="note" placeholder="Reason (optional)" className={`${input} w-40`} />
                    <button className="px-3 py-2 rounded-lg border border-border text-xs font-semibold text-destructive hover:bg-destructive/5">Reject</button>
                  </form>
                </div>
              )}
              {r.status === "approved" && (
                <form action={rejectScholarship} className="pt-1"><input type="hidden" name="id" value={r.id} />
                  <button className="text-xs text-destructive hover:underline">Revoke scholarship</button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
