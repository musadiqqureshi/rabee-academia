import Link from "next/link";
import { Users, UserCheck, BookOpen, GraduationCap } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminOverview() {
  await requireRole("admin");
  const supabase = await createClient();

  const [
    { count: studentCount },
    { count: pendingCount },
    { count: batchCount },
    { count: teacherCount },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("batches").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "teacher"),
  ]);

  const { data: pendingEnrollments } = await supabase
    .from("enrollments")
    .select(`
      id, enrolled_at,
      profiles ( full_name, email ),
      batches ( class_type, subjects ( name ) )
    `)
    .eq("status", "pending")
    .order("enrolled_at", { ascending: false })
    .limit(5);

  return (
    <div>
      <h1 className="text-2xl font-bold">Academic Operations</h1>
      <p className="text-sm text-muted-foreground mt-1">Platform management overview</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
        <StatCard label="Total Students" value={studentCount ?? 0} icon={Users} />
        <StatCard label="Pending Enrollments" value={pendingCount ?? 0} icon={UserCheck} hint={pendingCount ? "Needs review" : undefined} />
        <StatCard label="Active Batches" value={batchCount ?? 0} icon={BookOpen} />
        <StatCard label="Teachers" value={teacherCount ?? 0} icon={GraduationCap} />
      </div>

      {pendingEnrollments && pendingEnrollments.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Pending Enrollments</h2>
            <Link href="/dashboard/admin/enrollments" className="text-xs text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="bg-card border border-card-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Class Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendingEnrollments.map((e) => {
                  const student = e.profiles as unknown as { full_name: string | null; email: string | null } | null;
                  const batch = e.batches as unknown as { class_type: string | null; subjects: { name: string } | null } | null;
                  return (
                    <tr key={e.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium">{student?.full_name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{student?.email}</p>
                      </td>
                      <td className="px-4 py-3">{batch?.subjects?.name ?? "—"}</td>
                      <td className="px-4 py-3 capitalize text-muted-foreground">{batch?.class_type?.replace("_", " ") ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(e.enrolled_at).toLocaleDateString()}
                      </td>
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
