import Link from "next/link";
import { Receipt, ArrowRight } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { INVOICE_CATEGORY_LABEL, type InvoiceCategory } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function StudentInvoicesPage() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("student_id", profile.id)
    .order("issued_at", { ascending: false });

  const fmt = (n: number) => "PKR " + n.toLocaleString("en-PK");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Invoices</h1>
        <p className="text-sm text-muted-foreground mt-1">View and download your invoices.</p>
      </div>

      {invoices && invoices.length > 0 ? (
        <div className="grid gap-3">
          {invoices.map((i) => (
            <Link key={i.id} href={`/dashboard/student/invoices/${i.id}`}
              className="group flex items-center gap-4 rounded-2xl border border-card-border bg-card shadow-sm p-4 hover:shadow-md hover:border-primary/40 transition-all">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{i.invoice_number}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                  <span>{INVOICE_CATEGORY_LABEL[i.category as InvoiceCategory]}</span>
                  <span>Due {i.due_date ? new Date(i.due_date).toLocaleDateString() : "—"}</span>
                </div>
              </div>
              <span className="font-bold text-sm shrink-0">{fmt(i.amount_pkr)}</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${
                i.status === "paid" ? "bg-emerald-100 text-emerald-700"
                : i.status === "overdue" ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"}`}>{i.status}</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No invoices yet.
        </div>
      )}
    </div>
  );
}
