import { TrendingUp, Users, GraduationCap, Wallet, AlertCircle, ClipboardList, ListChecks, CheckCircle2 } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/dashboard/StatCard";

export const dynamic = "force-dynamic";

const fmt = (n: number) => "PKR " + (n ?? 0).toLocaleString("en-PK");

export default async function AdminAnalytics() {
  await requireRole("admin");
  const supabase = await createClient();

  const [
    { data: payments }, { count: students }, { count: teachers },
    { data: enrollments }, { data: subs }, { data: attempts }, { data: attendance },
  ] = await Promise.all([
    supabase.from("payments").select("amount_pkr, status, paid_at, created_at"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "teacher"),
    supabase.from("enrollments").select("status"),
    supabase.from("assignment_submissions").select("status"),
    supabase.from("quiz_attempts").select("status"),
    supabase.from("attendance").select("status"),
  ]);

  const pays = payments ?? [];
  const collected = pays.filter((p) => p.status === "paid").reduce((s, p) => s + (p.amount_pkr ?? 0), 0);
  const outstanding = pays.filter((p) => p.status === "pending" || p.status === "overdue").reduce((s, p) => s + (p.amount_pkr ?? 0), 0);

  // Revenue by month (paid).
  const byMonth = new Map<string, number>();
  for (const p of pays) {
    if (p.status !== "paid") continue;
    const d = p.paid_at ?? p.created_at;
    if (!d) continue;
    const key = String(d).slice(0, 7);
    byMonth.set(key, (byMonth.get(key) ?? 0) + (p.amount_pkr ?? 0));
  }
  const months = [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-6);
  const maxMonth = Math.max(1, ...months.map(([, v]) => v));

  const enr = enrollments ?? [];
  const approved = enr.filter((e) => e.status === "approved").length;
  const pendingEnr = enr.filter((e) => e.status === "pending").length;

  const subsArr = subs ?? [];
  const submitted = subsArr.filter((s) => s.status !== "draft").length;
  const graded = subsArr.filter((s) => s.status === "graded").length;
  const assignmentCompletion = subsArr.length ? Math.round((submitted / subsArr.length) * 100) : 0;

  const attemptsArr = attempts ?? [];
  const quizDone = attemptsArr.filter((a) => a.status !== "in_progress").length;
  const quizCompletion = attemptsArr.length ? Math.round((quizDone / attemptsArr.length) * 100) : 0;

  const att = attendance ?? [];
  const presentRate = att.length ? Math.round((att.filter((a) => a.status === "present").length / att.length) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Analytics &amp; Reporting</h1>
        <p className="text-sm text-muted-foreground mt-1">Revenue, academic and operational metrics.</p>
      </div>

      {/* Revenue */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Revenue</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Collected" value={fmt(collected)} icon={Wallet} />
          <StatCard label="Outstanding" value={fmt(outstanding)} icon={AlertCircle} />
          <StatCard label="Total Invoiced" value={fmt(collected + outstanding)} icon={TrendingUp} />
        </div>
        <div className="rounded-2xl border border-card-border bg-card shadow-sm p-5">
          <p className="text-xs font-medium text-muted-foreground mb-4">Monthly collected revenue</p>
          {months.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            <div className="flex items-end gap-3 h-40">
              {months.map(([m, v]) => (
                <div key={m} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">{fmt(v).replace("PKR ", "")}</span>
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-primary to-accent" style={{ height: `${Math.max(4, (v / maxMonth) * 100)}%` }} />
                  <span className="text-[10px] text-muted-foreground">{m.slice(5)}/{m.slice(2, 4)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Academic */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold flex items-center gap-2"><GraduationCap className="w-4 h-4 text-primary" /> Academic</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Students" value={students ?? 0} icon={Users} />
          <StatCard label="Teachers" value={teachers ?? 0} icon={Users} />
          <StatCard label="Active Enrollments" value={approved} icon={CheckCircle2} hint={`${pendingEnr} pending`} />
          <StatCard label="Avg Attendance" value={`${presentRate}%`} icon={ClipboardList} />
        </div>
      </section>

      {/* Operational */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold flex items-center gap-2"><ClipboardList className="w-4 h-4 text-primary" /> Operational</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ProgressCard label="Assignment completion" pct={assignmentCompletion} sub={`${graded} graded / ${subsArr.length} total`} icon={<ClipboardList className="w-4 h-4" />} />
          <ProgressCard label="Quiz completion" pct={quizCompletion} sub={`${quizDone} done / ${attemptsArr.length} attempts`} icon={<ListChecks className="w-4 h-4" />} />
          <ProgressCard label="Attendance present rate" pct={presentRate} sub={`${att.length} records`} icon={<CheckCircle2 className="w-4 h-4" />} />
        </div>
      </section>
    </div>
  );
}

function ProgressCard({ label, pct, sub, icon }: { label: string; pct: number; sub: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-card-border bg-card shadow-sm p-5">
      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">{icon}{label}</div>
      <p className="text-2xl font-extrabold">{pct}%</p>
      <div className="h-2 rounded-full bg-muted overflow-hidden mt-2">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[11px] text-muted-foreground mt-2">{sub}</p>
    </div>
  );
}
