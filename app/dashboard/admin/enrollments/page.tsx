import { UserCheck } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const statusStyle: Record<string, string> = {
  approved: "bg-green-500/15 text-green-400",
  pending: "bg-yellow-500/15 text-yellow-400",
  rejected: "bg-red-500/15 text-red-400",
  cancelled: "bg-muted text-muted-foreground",
};

export default async function AdminEnrollments() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      id, status, enrolled_at,
      profiles ( full_name, email ),
      batches ( class_type, subjects ( name ) )
    `)
    .order("enrolled_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold">Enrollments</h1>
      <p className="text-sm text-muted-foreground mt-1">All student enrollment requests</p>

      {(!enrollments || enrollments.length === 0) ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <UserCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No enrollments yet</p>
          <p className="text-sm text-muted-foreground mt-1">Enrollment requests will appear here.</p>
        </div>
      ) : (
        <div className="mt-6 bg-card border border-card-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Class Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Applied</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {enrollments.map((e) => {
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
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${statusStyle[e.status] ?? "bg-muted text-muted-foreground"}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(e.enrolled_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {e.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <button disabled className="px-2 py-1 rounded text-xs bg-green-500/15 text-green-400 cursor-not-allowed opacity-60" title="Coming soon">Approve</button>
                          <button disabled className="px-2 py-1 rounded text-xs bg-red-500/15 text-red-400 cursor-not-allowed opacity-60" title="Coming soon">Reject</button>
                        </div>
                      )}
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
