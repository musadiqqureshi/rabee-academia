import { ClipboardCheck, Download } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const statusStyle: Record<string, string> = {
  present: "bg-emerald-100 text-emerald-700",
  absent: "bg-red-100 text-red-700",
  late: "bg-amber-100 text-amber-700",
};

export default async function AdminAttendance() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: records } = await supabase
    .from("attendance")
    .select(`
      id, status, session_date,
      profiles:student_id ( full_name, student_code ),
      batches:batch_id ( class_type, subjects:subject_id ( name ) )
    `)
    .order("session_date", { ascending: false })
    .limit(200);

  return (
    <div>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Attendance</h1>
          <p className="text-sm text-muted-foreground mt-1">Recent attendance records across all classes</p>
        </div>
        <a href="/api/attendance/export"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted">
          <Download className="w-4 h-4" /> Export CSV
        </a>
      </div>

      {(!records || records.length === 0) ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <ClipboardCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No attendance records</p>
          <p className="text-sm text-muted-foreground mt-1">Records appear here once teachers mark attendance.</p>
        </div>
      ) : (
        <div className="mt-6 bg-card border border-card-border rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Class</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {records.map((r) => {
                const student = r.profiles as unknown as { full_name: string | null; student_code: string | null } | null;
                const batch = r.batches as unknown as { class_type: string | null; subjects: { name: string } | null } | null;
                return (
                  <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{student?.full_name ?? "—"}<span className="block text-xs text-muted-foreground">{student?.student_code ?? ""}</span></td>
                    <td className="px-4 py-3">{batch?.subjects?.name ?? "—"}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{batch?.class_type ?? "—"}</td>
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
  );
}
