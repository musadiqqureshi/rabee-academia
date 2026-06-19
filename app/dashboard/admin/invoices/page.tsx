import Link from "next/link";
import { Receipt, Wallet, AlertCircle, CheckCircle2 } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/dashboard/StatCard";
import CreateInvoiceForm from "./CreateInvoiceForm";
import { setInvoiceStatus } from "./actions";
import { INVOICE_CATEGORY_LABEL, type InvoiceCategory } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function AdminInvoicesPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, profiles:student_id ( full_name, student_code )")
    .order("issued_at", { ascending: false });

  const { data: students } = await supabase
    .from("profiles").select("id, full_name, email, student_code").eq("role", "student");
  const { data: subjects } = await supabase.from("subjects").select("id, name").eq("is_active", true);

  const studentOpts = (students ?? []).map((s) => ({
    id: s.id, label: `${s.full_name ?? s.email ?? "Student"}${s.student_code ? ` (${s.student_code})` : ""}`,
  }));

  const all = invoices ?? [];
  const outstanding = all.filter((i) => i.status === "issued" || i.status === "overdue");
  const totalOutstanding = outstanding.reduce((s, i) => s + i.amount_pkr, 0);
  const totalPaid = all.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount_pkr, 0);

  const fmt = (n: number) => "PKR " + n.toLocaleString("en-PK");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Invoices</h1>
        <p className="text-sm text-muted-foreground mt-1">Generate and track student invoices.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Invoices" value={all.length} icon={Receipt} />
        <StatCard label="Collected" value={fmt(totalPaid)} icon={CheckCircle2} />
        <StatCard label="Outstanding" value={fmt(totalOutstanding)} icon={AlertCircle} />
      </div>

      <CreateInvoiceForm students={studentOpts} subjects={subjects ?? []} />

      <div className="rounded-2xl border border-card-border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Invoice</th>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium text-right">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {all.map((i) => {
              const p = i.profiles as unknown as { full_name: string | null; student_code: string | null } | null;
              return (
                <tr key={i.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/admin/invoices/${i.id}`} className="font-medium text-primary hover:underline">
                      {i.invoice_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{p?.full_name ?? "—"}<span className="block text-xs text-muted-foreground">{p?.student_code ?? ""}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{INVOICE_CATEGORY_LABEL[i.category as InvoiceCategory]}</td>
                  <td className="px-4 py-3 text-right font-medium">{fmt(i.amount_pkr)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      i.status === "paid" ? "bg-emerald-100 text-emerald-700"
                      : i.status === "overdue" ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"}`}>{i.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {i.status !== "paid" && (
                      <form action={setInvoiceStatus} className="inline">
                        <input type="hidden" name="invoice_id" value={i.id} />
                        <input type="hidden" name="status" value="paid" />
                        <button className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline">
                          <Wallet className="w-3.5 h-3.5" /> Mark paid
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
            {all.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No invoices yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
