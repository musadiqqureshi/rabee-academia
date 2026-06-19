import { Network, Users, BookOpen, Layers } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/dashboard/StatCard";

export const dynamic = "force-dynamic";

const SEATS_PER_BATCH = 30; // notional capacity per batch

export default async function AllocationPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; q?: string }>;
}) {
  const { subject = "", q = "" } = await searchParams;
  await requireRole("admin");
  const supabase = await createClient();

  const { data: teachers } = await supabase
    .from("profiles").select("id, full_name, email").eq("role", "teacher");

  const { data: batches } = await supabase
    .from("batches")
    .select("id, teacher_id, is_active, class_type, subjects ( name ), enrollments ( id, status )");

  const { data: subjects } = await supabase.from("subjects").select("name").eq("is_active", true).order("name");

  type Row = {
    id: string; name: string; subjects: Set<string>;
    activeBatches: number; students: number;
  };
  const rows = new Map<string, Row>();
  for (const t of teachers ?? []) {
    rows.set(t.id, { id: t.id, name: t.full_name ?? t.email ?? "Teacher", subjects: new Set(), activeBatches: 0, students: 0 });
  }
  for (const b of batches ?? []) {
    const r = rows.get(b.teacher_id);
    if (!r) continue;
    const subjName = (b.subjects as unknown as { name: string } | null)?.name;
    if (subjName) r.subjects.add(subjName);
    if (b.is_active) r.activeBatches += 1;
    const enr = (b.enrollments as unknown as { status: string }[] | null) ?? [];
    r.students += enr.filter((e) => e.status === "approved").length;
  }

  let list = Array.from(rows.values());
  if (subject) list = list.filter((r) => r.subjects.has(subject));
  if (q) list = list.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));
  list.sort((a, b) => b.students - a.students);

  const totalStudents = list.reduce((s, r) => s + r.students, 0);
  const totalCapacity = list.reduce((s, r) => s + r.activeBatches * SEATS_PER_BATCH, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Teacher Allocation</h1>
        <p className="text-sm text-muted-foreground mt-1">Workload, capacity and subject coverage at a glance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Teachers" value={list.length} icon={Users} />
        <StatCard label="Students Allocated" value={totalStudents} icon={Layers} />
        <StatCard label="Available Seats" value={Math.max(0, totalCapacity - totalStudents)} icon={Network} />
      </div>

      {/* Filters */}
      <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-card-border bg-card shadow-sm p-4">
        <label className="block">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5">Subject</span>
          <select name="subject" defaultValue={subject} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option value="">All subjects</option>
            {(subjects ?? []).map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
          </select>
        </label>
        <label className="block flex-1 min-w-[180px]">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5">Teacher name</span>
          <input name="q" defaultValue={q} placeholder="Search…" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        </label>
        <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">Filter</button>
      </form>

      <div className="rounded-2xl border border-card-border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Teacher</th>
              <th className="px-4 py-3 font-medium">Subjects</th>
              <th className="px-4 py-3 font-medium text-right">Active Batches</th>
              <th className="px-4 py-3 font-medium text-right">Students</th>
              <th className="px-4 py-3 font-medium">Capacity</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => {
              const cap = r.activeBatches * SEATS_PER_BATCH;
              const pct = cap > 0 ? Math.min(100, Math.round((r.students / cap) * 100)) : 0;
              return (
                <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="inline-flex flex-wrap gap-1">
                      {r.subjects.size ? Array.from(r.subjects).map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-full bg-muted text-xs inline-flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> {s}
                        </span>
                      )) : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{r.activeBatches}</td>
                  <td className="px-4 py-3 text-right">{r.students}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{r.students}/{cap}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No teachers match the filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
