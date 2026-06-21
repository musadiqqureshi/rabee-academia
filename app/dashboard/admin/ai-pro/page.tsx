import { Crown, Check, X, FileText } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { approveProRequest, rejectProRequest } from "./actions";

export const dynamic = "force-dynamic";

interface Req {
  id: string;
  months: number;
  amount_pkr: number;
  receipt_url: string | null;
  status: string;
  created_at: string;
  profiles: { full_name: string | null; email: string | null } | null;
}

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-500",
  approved: "bg-green-500/15 text-green-500",
  rejected: "bg-destructive/15 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

export default async function AdminAiPro() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data } = await supabase
    .from("ai_pro_requests")
    .select("id, months, amount_pkr, receipt_url, status, created_at, profiles:user_id ( full_name, email )")
    .order("created_at", { ascending: false });
  const requests = (data ?? []) as unknown as Req[];

  // Signed URLs for receipts (works whether or not the bucket is public).
  const links = new Map<string, string>();
  await Promise.all(
    requests.filter((r) => r.receipt_url).map(async (r) => {
      const { data: signed } = await supabase.storage.from("receipts").createSignedUrl(r.receipt_url!, 3600);
      if (signed?.signedUrl) links.set(r.id, signed.signedUrl);
    }),
  );

  return (
    <div>
      <div className="flex items-center gap-2">
        <Crown className="w-6 h-6 text-amber-500" />
        <h1 className="text-2xl font-bold">AI Pro Requests</h1>
      </div>
      <p className="text-sm text-muted-foreground mt-1">Verify payments and activate Rabee&apos;s AI Pro subscriptions.</p>

      {requests.length === 0 ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <Crown className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No Pro requests yet</p>
          <p className="text-sm text-muted-foreground mt-1">Requests appear here when users submit a payment.</p>
        </div>
      ) : (
        <div className="mt-6 bg-card border border-card-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Receipt</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="font-medium">{r.profiles?.full_name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{r.profiles?.email ?? ""}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">PKR {r.amount_pkr.toLocaleString("en-PK")}<span className="text-xs text-muted-foreground"> · {r.months}mo</span></td>
                  <td className="px-4 py-3">
                    {links.get(r.id) ? (
                      <a href={links.get(r.id)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline text-xs"><FileText className="w-3.5 h-3.5" /> View</a>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_STYLE[r.status] ?? ""}`}>{r.status}</span></td>
                  <td className="px-4 py-3">
                    {r.status === "pending" ? (
                      <div className="flex items-center justify-end gap-2">
                        <form action={approveProRequest}>
                          <input type="hidden" name="request_id" value={r.id} />
                          <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-green-600 text-white hover:opacity-90"><Check className="w-3.5 h-3.5" /> Approve</button>
                        </form>
                        <form action={rejectProRequest}>
                          <input type="hidden" name="request_id" value={r.id} />
                          <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs border border-border text-destructive hover:bg-destructive/10"><X className="w-3.5 h-3.5" /> Reject</button>
                        </form>
                      </div>
                    ) : <span className="block text-right text-xs text-muted-foreground">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
