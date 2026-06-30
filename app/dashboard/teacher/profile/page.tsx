import { Wallet, CheckCircle2, Clock } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import ProfileCard from "@/components/dashboard/ProfileCard";
import StatCard from "@/components/dashboard/StatCard";

export const dynamic = "force-dynamic";
const fmt = (n: number) => "PKR " + n.toLocaleString("en-PK");

export default async function TeacherProfile() {
  const profile = await requireRole("teacher");
  const supabase = await createClient();
  const monthYear = new Date().toISOString().slice(0, 7);

  const { data: config } = await supabase
    .from("teacher_salary_config").select("per_student_rate, base_amount").eq("teacher_id", profile.id).maybeSingle();
  const { data: payments } = await supabase
    .from("salary_payments").select("*").eq("teacher_id", profile.id).order("month_year", { ascending: false });

  const paidThisMonth = (payments ?? []).find((p) => p.month_year === monthYear && p.status === "paid");
  const lastPaid = (payments ?? []).find((p) => p.status === "paid");

  return (
    <div className="space-y-6 max-w-3xl">
      <ProfileCard profile={profile} />

      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Wallet className="w-5 h-5 text-primary" /> Salary status</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <StatCard label={`This month (${monthYear})`} value={paidThisMonth ? "Paid" : "Pending"} icon={paidThisMonth ? CheckCircle2 : Clock}
            hint={paidThisMonth ? fmt(paidThisMonth.amount) : undefined} />
          <StatCard label="Last payment" value={lastPaid ? fmt(lastPaid.amount) : "—"} icon={Wallet}
            hint={lastPaid?.paid_at ? new Date(lastPaid.paid_at).toLocaleDateString() : undefined} />
        </div>

        {config && (
          <p className="text-xs text-muted-foreground mb-4">
            Your rate: base {fmt(config.base_amount)} + {fmt(config.per_student_rate)} per student. Salary is set by the academy admin.
          </p>
        )}

        <div className="rounded-2xl border border-card-border bg-card shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[420px]">
            <thead><tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Month</th><th className="px-4 py-3 font-medium text-center">Students</th>
              <th className="px-4 py-3 font-medium text-right">Amount</th><th className="px-4 py-3 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {(payments ?? []).map((p) => (
                <tr key={p.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3">{p.month_year}</td>
                  <td className="px-4 py-3 text-center">{p.student_count}</td>
                  <td className="px-4 py-3 text-right font-medium">{fmt(p.amount)}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>{p.status}</span></td>
                </tr>
              ))}
              {(payments ?? []).length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No salary payments recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
