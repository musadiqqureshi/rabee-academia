import { UserCheck, FileText } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/dashboard/StatCard";
import { approveEnrollment, rejectEnrollment } from "./actions";

export const dynamic = "force-dynamic";

const statusStyle: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-muted text-muted-foreground",
};

const fmt = (n: number) => "PKR " + (n ?? 0).toLocaleString("en-PK");

export default async function AdminEnrollments() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      id, status, created_at, class_type, payment_method, receipt_url,
      student_name, student_email,
      subjects:subject_id ( name ),
      payments ( amount_pkr, status )
    `)
    .order("created_at", { ascending: false });

  const rows = enrollments ?? [];
  const pending = rows.filter((e) => e.status === "pending").length;
  const approved = rows.filter((e) => e.status === "approved").length;

  // Pre-sign receipt URLs for quick admin verification.
  const receiptLinks = new Map<string, string>();
  for (const e of rows) {
    if (e.receipt_url) {
      const { data } = await supabase.storage.from("receipts").createSignedUrl(e.receipt_url, 3600);
      if (data?.signedUrl) receiptLinks.set(e.id, data.signedUrl);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Enrollments</h1>
        <p className="text-sm text-muted-foreground mt-1">Review enrollment requests and verify payments.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Requests" value={rows.length} icon={UserCheck} />
        <StatCard label="Pending Review" value={pending} icon={UserCheck} />
        <StatCard label="Approved" value={approved} icon={UserCheck} />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No enrollment requests yet.
        </div>
      ) : (
        <div className="rounded-2xl border border-card-border bg-card shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Course</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Method</th>
                <th className="px-4 py-3 font-medium">Receipt</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => {
                const subject = e.subjects as unknown as { name: string } | null;
                const payment = (e.payments as unknown as { amount_pkr: number; status: string }[] | null)?.[0];
                const receipt = receiptLinks.get(e.id);
                return (
                  <tr key={e.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium">{e.student_name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{e.student_email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {subject?.name ?? "—"}
                      <span className="block text-xs text-muted-foreground capitalize">{e.class_type ?? ""}</span>
                    </td>
                    <td className="px-4 py-3 font-medium">{fmt(payment?.amount_pkr ?? 0)}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{e.payment_method === "iban" ? "Bank transfer" : e.payment_method ?? "—"}</td>
                    <td className="px-4 py-3">
                      {receipt ? (
                        <a href={receipt} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline text-xs">
                          <FileText className="w-3.5 h-3.5" /> View
                        </a>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyle[e.status] ?? "bg-muted text-muted-foreground"}`}>{e.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {e.status === "pending" && (
                        <div className="flex items-center justify-end gap-2">
                          <form action={approveEnrollment}>
                            <input type="hidden" name="enrollment_id" value={e.id} />
                            <button className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:opacity-90">Approve</button>
                          </form>
                          <form action={rejectEnrollment}>
                            <input type="hidden" name="enrollment_id" value={e.id} />
                            <button className="px-2.5 py-1 rounded-lg text-xs font-medium border border-border hover:bg-muted">Reject</button>
                          </form>
                        </div>
                      )}
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
