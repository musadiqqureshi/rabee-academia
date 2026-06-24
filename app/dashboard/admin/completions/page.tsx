import { GraduationCap } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/dashboard/StatCard";

export const dynamic = "force-dynamic";

export default async function AdminCompletions() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("enrollments")
    .select("id, completed_at, student:student_id ( full_name, email, student_code ), subjects:subject_id ( name )")
    .eq("completed", true)
    .order("completed_at", { ascending: false });

  const list = rows ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Completed Courses</h1>
        <p className="text-sm text-muted-foreground mt-1">Students who have completed a course (certificates auto-issued).</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Total Completions" value={list.length} icon={GraduationCap} />
        <StatCard label="Students Graduated" value={new Set(list.map((r) => (r.student as unknown as { email: string } | null)?.email)).size} icon={GraduationCap} />
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No completed courses yet. Mark a batch complete from the Batches page.
        </div>
      ) : (
        <div className="rounded-2xl border border-card-border bg-card shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Student ID</th>
                <th className="px-4 py-3 font-medium">Course</th>
                <th className="px-4 py-3 font-medium">Completed</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => {
                const s = r.student as unknown as { full_name: string | null; email: string | null; student_code: string | null } | null;
                const subj = r.subjects as unknown as { name: string } | null;
                return (
                  <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{s?.full_name ?? "—"}<span className="block text-xs text-muted-foreground">{s?.email}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{s?.student_code ?? "—"}</td>
                    <td className="px-4 py-3">{subj?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.completed_at ? new Date(r.completed_at).toLocaleDateString() : "—"}</td>
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
