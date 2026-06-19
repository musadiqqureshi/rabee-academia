import { ClipboardList } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/dashboard/StatCard";

export const dynamic = "force-dynamic";

export default async function AdminAssignmentsPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, title, total_marks, teacher_id, subjects ( name ), profiles:teacher_id ( full_name )")
    .order("created_at", { ascending: false });

  const ids = assignments?.map((a) => a.id) ?? [];
  const { data: subs } = await supabase
    .from("assignment_submissions")
    .select("assignment_id, status")
    .in("assignment_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);

  const agg = new Map<string, { submitted: number; graded: number }>();
  for (const s of subs ?? []) {
    const a = agg.get(s.assignment_id) ?? { submitted: 0, graded: 0 };
    if (s.status !== "draft") a.submitted += 1;
    if (s.status === "graded") a.graded += 1;
    agg.set(s.assignment_id, a);
  }

  const totalSubmitted = (subs ?? []).filter((s) => s.status !== "draft").length;
  const totalGraded = (subs ?? []).filter((s) => s.status === "graded").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assignments Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor assignment activity across all teachers.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Assignments" value={assignments?.length ?? 0} icon={ClipboardList} />
        <StatCard label="Submissions" value={totalSubmitted} icon={ClipboardList} />
        <StatCard label="Graded" value={totalGraded} icon={ClipboardList} />
      </div>

      <div className="rounded-2xl border border-card-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Assignment</th>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Teacher</th>
              <th className="px-4 py-3 font-medium text-right">Submitted</th>
              <th className="px-4 py-3 font-medium text-right">Graded</th>
            </tr>
          </thead>
          <tbody>
            {(assignments ?? []).map((a) => {
              const c = agg.get(a.id) ?? { submitted: 0, graded: 0 };
              return (
                <tr key={a.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{a.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{(a.subjects as unknown as { name: string } | null)?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{(a.profiles as unknown as { full_name: string } | null)?.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-right">{c.submitted}</td>
                  <td className="px-4 py-3 text-right">{c.graded}</td>
                </tr>
              );
            })}
            {(!assignments || assignments.length === 0) && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No assignments yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
