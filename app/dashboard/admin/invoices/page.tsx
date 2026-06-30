import Link from "next/link";
import { Receipt, Wallet, AlertCircle, CheckCircle2 } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/dashboard/StatCard";
import CreateInvoiceForm from "./CreateInvoiceForm";
import { setInvoiceStatus, generateMonthlyInvoicesNow, setStudentDiscount } from "./actions";
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

  // Resolve the uploaded payment screenshot for each invoice. Course-enrollment
  // invoices carry it on enrollments.receipt_url; instructor-fee invoices carry
  // it on instructor_applications.receipt_url (matched by the INS code in the
  // description). Sign the storage paths so admins can view them inline.
  const enrollmentIds = all.map((i) => i.enrollment_id).filter(Boolean) as string[];
  const { data: enrollRows } = enrollmentIds.length
    ? await supabase.from("enrollments").select("id, receipt_url").in("id", enrollmentIds)
    : { data: [] as { id: string; receipt_url: string | null }[] };
  const enrollReceipt = new Map((enrollRows ?? []).map((e) => [e.id, e.receipt_url]));
  const { data: instrApps } = await supabase
    .from("instructor_applications").select("user_id, code, receipt_url");

  const receiptUrl = new Map<string, string>();
  for (const i of all) {
    let path: string | null = i.enrollment_id ? enrollReceipt.get(i.enrollment_id) ?? null : null;
    if (!path && typeof i.description === "string") {
      const m = i.description.match(/code (INS-\w+)/);
      if (m) path = (instrApps ?? []).find((a) => a.code === m[1] && a.user_id === i.student_id)?.receipt_url ?? null;
    }
    if (path) {
      const { data } = await supabase.storage.from("receipts").createSignedUrl(path, 3600);
      if (data?.signedUrl) receiptUrl.set(i.id, data.signedUrl);
    }
  }

  // Instructor-fee invoices reuse the "registration" category; show a clearer label.
  const categoryLabel = (i: { category: string; description: string | null }) =>
    typeof i.description === "string" && i.description.startsWith("Instructor application fee")
      ? "Instructor Registration"
      : INVOICE_CATEGORY_LABEL[i.category as InvoiceCategory];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate and track student invoices. Monthly fees auto-generate on the 1st (due the 5th).</p>
        </div>
        <form action={generateMonthlyInvoicesNow}>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">
            <Receipt className="w-4 h-4" /> Generate this month&apos;s fees
          </button>
        </form>
      </div>

      {/* Per-student monthly-fee discount */}
      <div className="rounded-2xl border border-card-border bg-card p-4">
        <p className="text-sm font-semibold mb-3">Set a student&apos;s monthly-fee discount</p>
        <form action={setStudentDiscount} className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="block text-xs text-muted-foreground mb-1">Student</span>
            <select name="student_id" required className="rounded-lg border border-input bg-background px-3 py-2 text-sm min-w-[200px]">
              <option value="">Select…</option>
              {studentOpts.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs text-muted-foreground mb-1">Subject (optional)</span>
            <select name="subject_id" className="rounded-lg border border-input bg-background px-3 py-2 text-sm min-w-[160px]">
              <option value="">All subjects</option>
              {(subjects ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs text-muted-foreground mb-1">Discount %</span>
            <input name="discount_pct" type="number" min={0} max={100} defaultValue={0} className="w-24 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          </label>
          <button className="px-4 py-2 rounded-lg border border-border text-sm font-semibold hover:bg-muted">Save discount</button>
        </form>
        <p className="text-[11px] text-muted-foreground mt-2">Set 0% to remove a discount. Applies to future monthly invoices.</p>
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
              <th className="px-4 py-3 font-medium">Receipt</th>
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
                  <td className="px-4 py-3 text-muted-foreground">{categoryLabel(i)}</td>
                  <td className="px-4 py-3 text-right font-medium">{fmt(i.amount_pkr)}</td>
                  <td className="px-4 py-3">
                    {receiptUrl.has(i.id) ? (
                      <a href={receiptUrl.get(i.id)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs font-medium">View</a>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
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
              <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No invoices yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
