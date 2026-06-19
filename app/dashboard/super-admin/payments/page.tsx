import { Wallet } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const statusStyle: Record<string, string> = {
  paid: "bg-green-500/15 text-green-400",
  pending: "bg-yellow-500/15 text-yellow-400",
  overdue: "bg-red-500/15 text-red-400",
  refunded: "bg-orange-500/15 text-orange-400",
};

export default async function SuperAdminPayments() {
  await requireRole("super_admin");
  const supabase = await createClient();

  const { data: payments } = await supabase
    .from("payments")
    .select(`
      id, amount, currency, status, method, due_date, paid_at,
      profiles ( full_name ),
      batches ( subjects ( name ) )
    `)
    .order("due_date", { ascending: false });

  const totalRevenue = payments
    ?.filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + (p.amount ?? 0), 0) ?? 0;

  const currency = payments?.[0]?.currency ?? "USD";

  return (
    <div>
      <h1 className="text-2xl font-bold">Payments & Revenue</h1>
      <p className="text-sm text-muted-foreground mt-1">All payment records across the platform</p>

      <div className="mt-4 inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2">
        <Wallet className="w-4 h-4 text-green-400" />
        <span className="text-sm text-green-400 font-medium">
          Total Revenue: {currency} {totalRevenue.toLocaleString()}
        </span>
      </div>

      {(!payments || payments.length === 0) ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No payment records</p>
          <p className="text-sm text-muted-foreground mt-1">Payments will appear here once students enroll.</p>
        </div>
      ) : (
        <div className="mt-6 bg-card border border-card-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Due</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((p) => {
                const student = p.profiles as unknown as { full_name: string | null } | null;
                const batch = p.batches as unknown as { subjects: { name: string } | null } | null;
                return (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{student?.full_name ?? "—"}</td>
                    <td className="px-4 py-3">{batch?.subjects?.name ?? "—"}</td>
                    <td className="px-4 py-3">{p.currency} {p.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{p.method?.replace("_", " ") ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${statusStyle[p.status] ?? "bg-muted text-muted-foreground"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {p.due_date ? new Date(p.due_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
