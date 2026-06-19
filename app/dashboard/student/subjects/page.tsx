import { BookOpen } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function StudentSubjects() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      id, status, enrolled_at,
      batches (
        id, class_type, start_date, end_date,
        subjects ( name, level ),
        profiles ( full_name ),
        schedules ( day_of_week, start_time, end_time )
      )
    `)
    .eq("student_id", profile.id)
    .eq("status", "approved")
    .order("enrolled_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold">My Subjects</h1>
      <p className="text-sm text-muted-foreground mt-1">Your approved enrollments</p>

      {(!enrollments || enrollments.length === 0) ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No enrolled subjects</p>
          <p className="text-sm text-muted-foreground mt-1">
            Once your enrollment is approved, your subjects will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 bg-card border border-card-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Teacher</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Class Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Schedule</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Enrolled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {enrollments.map((e) => {
                const batch = e.batches as unknown as {
                  class_type: string | null;
                  subjects: { name: string; level: string } | null;
                  profiles: { full_name: string | null } | null;
                  schedules: { day_of_week: string; start_time: string; end_time: string }[] | null;
                } | null;
                const schedDays = batch?.schedules?.map((s) => s.day_of_week).join(", ") ?? "TBD";
                const schedTime = batch?.schedules?.[0]
                  ? `${batch.schedules[0].start_time} – ${batch.schedules[0].end_time}`
                  : "TBD";
                return (
                  <tr key={e.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{batch?.subjects?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{batch?.subjects?.level ?? "—"}</td>
                    <td className="px-4 py-3">{batch?.profiles?.full_name ?? "—"}</td>
                    <td className="px-4 py-3 capitalize">{batch?.class_type?.replace("_", " ") ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs">{schedDays}</span>
                      <br />
                      <span className="text-xs text-muted-foreground">{schedTime}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(e.enrolled_at).toLocaleDateString()}
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
