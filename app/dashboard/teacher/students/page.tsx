import { Users } from "lucide-react";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import RealtimeRefresher from "@/components/dashboard/RealtimeRefresher";

export const dynamic = "force-dynamic";

// Teachers can't always read student profiles via RLS — resolve names + codes
// with the service role (falls back to the enrollment's stored name/email).
async function resolveStudents(ids: string[]) {
  const out = new Map<string, { full_name: string | null; email: string | null; student_code: string | null }>();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || ids.length === 0) return out;
  const admin = createAdminClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data } = await admin.from("profiles").select("id, full_name, email, student_code").in("id", ids);
  for (const p of data ?? []) out.set(p.id as string, { full_name: p.full_name, email: p.email, student_code: p.student_code });
  return out;
}

const statusStyle: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-muted text-muted-foreground",
};

const SELECT = "id, status, created_at, class_type, student_id, student_name, student_email, student:student_id ( full_name, email, student_code ), subjects:subject_id ( name )";

interface Row {
  id: string; status: string; created_at: string; class_type: string | null;
  student_id: string | null; student_name: string | null; student_email: string | null;
  student: unknown; subjects: unknown;
}

export default async function TeacherStudents() {
  const profile = await requireRole("teacher");
  const supabase = await createClient();

  // Students allotted directly to this teacher, OR enrolled in one of their
  // batches. Explicit FK aliases avoid ambiguous-embed errors.
  const { data: byTeacher } = await supabase
    .from("enrollments").select(SELECT)
    .eq("teacher_id", profile.id).eq("status", "approved")
    .order("created_at", { ascending: false });

  const { data: batches } = await supabase.from("batches").select("id").eq("teacher_id", profile.id);
  const batchIds = (batches ?? []).map((b) => b.id);
  const byBatch = batchIds.length
    ? (await supabase.from("enrollments").select(SELECT).in("batch_id", batchIds).eq("status", "approved")).data
    : [];

  const map = new Map<string, Row>();
  for (const e of [...(byTeacher ?? []), ...(byBatch ?? [])] as Row[]) map.set(e.id, e);
  const rows = [...map.values()];
  const resolved = await resolveStudents([...new Set(rows.map((r) => r.student_id).filter(Boolean) as string[])]);

  return (
    <div>
      <RealtimeRefresher tables={["enrollments"]} />
      <h1 className="text-2xl font-bold">My Students</h1>
      <p className="text-sm text-muted-foreground mt-1">
        {rows.length} student{rows.length !== 1 ? "s" : ""} across your subjects
      </p>

      {rows.length === 0 ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No students yet</p>
          <p className="text-sm text-muted-foreground mt-1">Students allotted to you appear here once their enrollment is approved.</p>
        </div>
      ) : (
        <div className="mt-6 bg-card border border-card-border rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Student ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Class</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((e) => {
                const joined = e.student as { full_name: string | null; email: string | null; student_code: string | null } | null;
                const r = e.student_id ? resolved.get(e.student_id) : null;
                const name = r?.full_name ?? joined?.full_name ?? e.student_name ?? "—";
                const email = r?.email ?? joined?.email ?? e.student_email ?? "";
                const code = r?.student_code ?? joined?.student_code ?? "—";
                const subject = e.subjects as { name: string } | null;
                return (
                  <tr key={e.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{name}<span className="block text-xs text-muted-foreground">{email}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{code}</td>
                    <td className="px-4 py-3">{subject?.name ?? "—"}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{e.class_type?.replace("_", " ") ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${statusStyle[e.status] ?? "bg-muted text-muted-foreground"}`}>{e.status}</span>
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
