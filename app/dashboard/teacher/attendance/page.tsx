import { ClipboardCheck } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const statusStyle: Record<string, string> = {
  present: "bg-green-500/15 text-green-400",
  absent: "bg-red-500/15 text-red-400",
  late: "bg-orange-500/15 text-orange-400",
};

export default async function TeacherAttendance() {
  const profile = await requireRole("teacher");
  const supabase = await createClient();

  const { data: batches } = await supabase
    .from("batches")
    .select("id, schedules ( id )")
    .eq("teacher_id", profile.id);

  const scheduleIds = batches?.flatMap((b) =>
    (b.schedules as { id: string }[] | null)?.map((s) => s.id) ?? []
  ) ?? [];

  const { data: records } = await supabase
    .from("attendance")
    .select(`
      id, status, marked_at,
      schedules ( day_of_week, start_time, batches ( subjects ( name ) ) ),
      profiles ( full_name )
    `)
    .in("schedule_id", scheduleIds.length > 0 ? scheduleIds : ["00000000-0000-0000-0000-000000000000"])
    .order("marked_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-2xl font-bold">Attendance</h1>
      <p className="text-sm text-muted-foreground mt-1">Recent attendance records for your classes</p>

      <div className="mt-4 p-3 bg-muted/20 border border-border rounded-lg text-xs text-muted-foreground">
        Attendance is marked by the admin panel. This view shows existing records only.
      </div>

      {(!records || records.length === 0) ? (
        <div className="mt-6 bg-card border border-card-border rounded-xl p-10 text-center">
          <ClipboardCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No attendance records</p>
          <p className="text-sm text-muted-foreground mt-1">Attendance records will appear here once marked.</p>
        </div>
      ) : (
        <div className="mt-6 bg-card border border-card-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Session</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Marked At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {records.map((r) => {
                const student = r.profiles as unknown as { full_name: string | null } | null;
                const schedule = r.schedules as unknown as {
                  day_of_week: string;
                  start_time: string;
                  batches: { subjects: { name: string } | null } | null;
                } | null;
                return (
                  <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{student?.full_name ?? "—"}</td>
                    <td className="px-4 py-3">{schedule?.batches?.subjects?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {schedule?.day_of_week} {schedule?.start_time}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${statusStyle[r.status] ?? "bg-muted text-muted-foreground"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(r.marked_at).toLocaleString()}
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
