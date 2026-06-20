import { Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const statusStyle: Record<string, string> = {
  approved: "bg-green-500/15 text-green-400",
  pending: "bg-yellow-500/15 text-yellow-400",
  rejected: "bg-red-500/15 text-red-400",
  cancelled: "bg-muted text-muted-foreground",
};

export default async function TeacherStudents() {
  const profile = await requireRole("teacher");
  const supabase = await createClient();

  const { data: batches } = await supabase
    .from("batches")
    .select("id, class_type, subjects ( name )")
    .eq("teacher_id", profile.id);

  const batchIds = batches?.map((b) => b.id) ?? [];

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, status, enrolled_at, batch_id, profiles ( full_name, email )")
    .in("batch_id", batchIds.length > 0 ? batchIds : ["00000000-0000-0000-0000-000000000000"])
    .order("enrolled_at", { ascending: false });

  const batchMap = new Map(batches?.map((b) => [b.id, b]) ?? []);

  return (
    <div>
      <h1 className="text-2xl font-bold">My Students</h1>
      <p className="text-sm text-muted-foreground mt-1">
        {enrollments?.length ?? 0} student{enrollments?.length !== 1 ? "s" : ""} across your batches
      </p>

      {(!enrollments || enrollments.length === 0) ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No students yet</p>
          <p className="text-sm text-muted-foreground mt-1">Students enrolled in your batches will appear here.</p>
        </div>
      ) : (
        <div className="mt-6 bg-card border border-card-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Class Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {enrollments.map((e) => {
                const student = e.profiles as unknown as { full_name: string | null; email: string | null } | null;
                const batch = batchMap.get(e.batch_id);
                const subject = batch?.subjects as unknown as { name: string } | null;
                return (
                  <tr key={e.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{student?.full_name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{student?.email ?? "—"}</td>
                    <td className="px-4 py-3">{subject?.name ?? "—"}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{batch?.class_type?.replace("_", " ") ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${statusStyle[e.status] ?? "bg-muted text-muted-foreground"}`}>
                        {e.status}
                      </span>
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
