import { Wallet, CheckCircle2, Clock } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/dashboard/StatCard";
import { saveSalaryConfig, markSalaryPaid } from "./actions";

export const dynamic = "force-dynamic";

const fmt = (n: number) => "PKR " + n.toLocaleString("en-PK");

export default async function AdminPayroll() {
  await requireRole("admin");
  const supabase = await createClient();
  const monthYear = new Date().toISOString().slice(0, 7);

  const [{ data: teachers }, { data: batches }, { data: enrollments }, { data: configs }, { data: payments }] =
    await Promise.all([
      supabase.from("profiles").select("id, full_name, email").eq("role", "teacher").order("full_name"),
      supabase.from("batches").select("id, teacher_id").eq("is_active", true),
      supabase.from("enrollments").select("batch_id").eq("status", "approved"),
      supabase.from("teacher_salary_config").select("teacher_id, per_student_rate, base_amount"),
      supabase.from("salary_payments").select("*").order("month_year", { ascending: false }),
    ]);

  // students per teacher (approved enrollments in the teacher's active batches)
  const batchTeacher = new Map((batches ?? []).map((b) => [b.id as string, b.teacher_id as string]));
  const countByTeacher = new Map<string, number>();
  for (const e of enrollments ?? []) {
    const t = e.batch_id ? batchTeacher.get(e.batch_id as string) : null;
    if (t) countByTeacher.set(t, (countByTeacher.get(t) ?? 0) + 1);
  }
  const cfg = new Map((configs ?? []).map((c) => [c.teacher_id as string, c]));
  const paidThisMonth = new Set((payments ?? []).filter((p) => p.month_year === monthYear && p.status === "paid").map((p) => p.teacher_id as string));

  const rows = (teachers ?? []).map((t) => {
    const c = cfg.get(t.id as string);
    const rate = c?.per_student_rate ?? 0;
    const base = c?.base_amount ?? 0;
    const count = countByTeacher.get(t.id as string) ?? 0;
    const salary = base + rate * count;
    return { id: t.id as string, name: t.full_name ?? t.email ?? "Teacher", rate, base, count, salary, paid: paidThisMonth.has(t.id as string) };
  });

  const totalPayroll = rows.reduce((s, r) => s + r.salary, 0);
  const paidCount = rows.filter((r) => r.paid).length;
  const inputCls = "w-24 rounded-lg border border-input bg-background px-2 py-1.5 text-sm";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Wallet className="w-6 h-6 text-primary" /> Teacher Payroll</h1>
        <p className="text-sm text-muted-foreground mt-1">Set each teacher&apos;s salary, then mark monthly payments. Salary = base + rate × current students ({monthYear}).</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Teachers" value={rows.length} icon={Wallet} />
        <StatCard label={`Payroll (${monthYear})`} value={fmt(totalPayroll)} icon={Clock} />
        <StatCard label="Paid this month" value={`${paidCount}/${rows.length}`} icon={CheckCircle2} />
      </div>

      <div className="rounded-2xl border border-card-border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Teacher</th>
              <th className="px-4 py-3 font-medium">Base + per-student rate</th>
              <th className="px-4 py-3 font-medium text-center">Students</th>
              <th className="px-4 py-3 font-medium text-right">Salary ({monthYear})</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3">
                  <form action={saveSalaryConfig} className="flex items-center gap-2">
                    <input type="hidden" name="teacher_id" value={r.id} />
                    <input name="base_amount" type="number" min={0} defaultValue={r.base} className={inputCls} title="Base amount" />
                    <span className="text-muted-foreground">+</span>
                    <input name="per_student_rate" type="number" min={0} defaultValue={r.rate} className={inputCls} title="Per student" />
                    <button className="px-2.5 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted">Save</button>
                  </form>
                </td>
                <td className="px-4 py-3 text-center">{r.count}</td>
                <td className="px-4 py-3 text-right font-bold">{fmt(r.salary)}</td>
                <td className="px-4 py-3 text-right">
                  {r.paid ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> Paid</span>
                  ) : (
                    <form action={markSalaryPaid} className="inline">
                      <input type="hidden" name="teacher_id" value={r.id} />
                      <input type="hidden" name="month_year" value={monthYear} />
                      <input type="hidden" name="amount" value={r.salary} />
                      <input type="hidden" name="student_count" value={r.count} />
                      <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90">Mark paid</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No teachers yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Payment history */}
      {(payments ?? []).length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Payment history</h2>
          <div className="rounded-2xl border border-card-border bg-card shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Month</th>
                  <th className="px-4 py-3 font-medium">Teacher</th>
                  <th className="px-4 py-3 font-medium text-center">Students</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium">Paid</th>
                </tr>
              </thead>
              <tbody>
                {(payments ?? []).map((p) => {
                  const t = rows.find((r) => r.id === p.teacher_id);
                  return (
                    <tr key={p.id} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-3">{p.month_year}</td>
                      <td className="px-4 py-3">{t?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-center">{p.student_count}</td>
                      <td className="px-4 py-3 text-right font-medium">{fmt(p.amount)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
