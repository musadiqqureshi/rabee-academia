import { BookOpen } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherSubjects() {
  const profile = await requireRole("teacher");
  const supabase = await createClient();

  const { data: batches } = await supabase
    .from("batches")
    .select(`
      id, class_type, start_date, end_date, max_students, is_active,
      subjects ( name, level ),
      schedules ( day_of_week ),
      enrollments ( id )
    `)
    .eq("teacher_id", profile.id)
    .order("start_date", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold">My Subjects</h1>
      <p className="text-sm text-muted-foreground mt-1">Batches you are teaching</p>

      {(!batches || batches.length === 0) ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No batches assigned</p>
          <p className="text-sm text-muted-foreground mt-1">Batches assigned to you by admin will appear here.</p>
        </div>
      ) : (
        <div className="mt-6 bg-card border border-card-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Class Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Schedule Days</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Students</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Start Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {batches.map((b) => {
                const subject = b.subjects as unknown as { name: string; level: string } | null;
                const days = (b.schedules as { day_of_week: string }[] | null)?.map((s) => s.day_of_week.slice(0, 3)).join(", ") ?? "TBD";
                const studentCount = (b.enrollments as { id: string }[] | null)?.length ?? 0;
                return (
                  <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{subject?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{subject?.level ?? "—"}</td>
                    <td className="px-4 py-3 capitalize">{b.class_type?.replace("_", " ") ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{days}</td>
                    <td className="px-4 py-3">{studentCount} / {b.max_students ?? "∞"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.start_date ? new Date(b.start_date).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${b.is_active ? "bg-green-500/15 text-green-400" : "bg-muted text-muted-foreground"}`}>
                        {b.is_active ? "Active" : "Inactive"}
                      </span>
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
