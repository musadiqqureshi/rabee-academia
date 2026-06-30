import { Wallet, AlertCircle, CheckCircle2 } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import ProfileCard from "@/components/dashboard/ProfileCard";
import StatCard from "@/components/dashboard/StatCard";
import { INVOICE_CATEGORY_LABEL, type InvoiceCategory } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";
const fmt = (n: number) => "PKR " + n.toLocaleString("en-PK");

export default async function StudentProfile() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: invoices } = await supabase
    .from("invoices").select("*").eq("student_id", profile.id).order("issued_at", { ascending: false });
  const all = invoices ?? [];
  const outstanding = all.filter((i) => i.status === "issued" || i.status === "overdue").reduce((s, i) => s + i.amount_pkr, 0);
  const paid = all.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount_pkr, 0);

  return (
    <div className="space-y-6 max-w-3xl">
      <ProfileCard profile={profile} />

      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Wallet className="w-5 h-5 text-primary" /> Payment status</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <StatCard label="Outstanding" value={fmt(outstanding)} icon={AlertCircle} hint={outstanding ? "Please clear by the 5th" : "All clear"} />
          <StatCard label="Total paid" value={fmt(paid)} icon={CheckCircle2} />
        </div>
        <div className="rounded-2xl border border-card-border bg-card shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead><tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Invoice</th><th className="px-4 py-3 font-medium">For</th>
              <th className="px-4 py-3 font-medium text-right">Amount</th><th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {all.map((i) => (
                <tr key={i.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 font-medium">{i.invoice_number}</td>
                  <td className="px-4 py-3 text-muted-foreground">{INVOICE_CATEGORY_LABEL[i.category as InvoiceCategory] ?? i.category}</td>
                  <td className="px-4 py-3 text-right font-medium">{fmt(i.amount_pkr)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{i.due_date ? new Date(i.due_date).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${i.status === "paid" ? "bg-emerald-100 text-emerald-700" : i.status === "overdue" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{i.status}</span>
                  </td>
                </tr>
              ))}
              {all.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No invoices yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
