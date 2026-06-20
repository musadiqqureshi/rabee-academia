import { ClipboardCheck, Download } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import MarkAttendanceForm from "./MarkAttendanceForm";

export const dynamic = "force-dynamic";

const statusStyle: Record<string, string> = {
  present: "bg-emerald-100 text-emerald-700",
  absent: "bg-red-100 text-red-700",
  late: "bg-amber-100 text-amber-700",
};

export default async function TeacherAttendance() {
  const profile = await requireRole("teacher");
  const supabase = await createClient();

  // Teacher's batches + their approved students.
  const { data: batches } = await supabase
    .from("batches")
    .select("id, class_type, subjects:subject_id ( name )")
    .eq("teacher_id", profile.id);

  const batchIds = (batches ?? []).map((b) => b.id);

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("batch_id, profiles:student_id ( id, full_name )")
    .in("batch_id", batchIds.length > 0 ? batchIds : ["00000000-0000-0000-0000-000000000000"])
    .eq("status", "approved");

  const studentsByBatch = new Map<string, { id: string; name: string }[]>();
  for (const e of enrollments ?? []) {
    const p = e.profiles as unknown as { id: string; full_name: string | null } | null;
    if (!e.batch_id || !p) continue;
    const list = studentsByBatch.get(e.batch_id) ?? [];
    list.push({ id: p.id, name: p.full_name ?? "Student" });
    studentsByBatch.set(e.batch_id, list);
  }

  const batchData = (batches ?? []).map((b) => ({
    id: b.id,
    label: `${(b.subjects as unknown as { name: string } | null)?.name ?? "Subject"} · ${b.class_type}`,
    students: studentsByBatch.get(b.id) ?? [],
  }));

  // Recent records (batch/date based).
  const { data: records } = await supabase
    .from("attendance")
    .select("id, status, session_date, batch_id, profiles:student_id ( full_name )")
    .in("batch_id", batchIds.length > 0 ? batchIds : ["00000000-0000-0000-0000-000000000000"])
    .order("session_date", { ascending: false })
    .limit(100);

  const batchLabel = new Map(batchData.map((b) => [b.id, b.label]));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Attendance</h1>
          <p className="text-sm text-muted-foreground mt-1">Mark and review attendance for your classes.</p>
        </div>
        <a href="/api/attendance/export"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted">
          <Download className="w-4 h-4" /> Export CSV
        </a>
      </div>

      <MarkAttendanceForm batches={batchData} />

      <div>
        <h2 className="font-semibold text-sm mb-3">Recent records</h2>
        {(!records || records.length === 0) ? (
          <div className="bg-card border border-card-border rounded-xl p-10 text-center">
            <ClipboardCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">No attendance records yet</p>
            <p className="text-sm text-muted-foreground mt-1">Mark attendance above to see records here.</p>
          </div>
        ) : (
          <div className="bg-card border border-card-border rounded-xl overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map((r) => {
                  const student = r.profiles as unknown as { full_name: string | null } | null;
                  return (
                    <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{student?.full_name ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{batchLabel.get(r.batch_id ?? "") ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.session_date ? new Date(r.session_date).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${statusStyle[r.status] ?? "bg-muted text-muted-foreground"}`}>
                          {r.status}
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
    </div>
  );
}
