import { Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import RealtimeRefresher from "@/components/dashboard/RealtimeRefresher";
import { revokeEnrollment } from "./actions";

export const dynamic = "force-dynamic";

const statusStyle: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-700",
  pending:  "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-muted text-muted-foreground",
};

export default async function AdminStudents() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: students } = await supabase
    .from("profiles")
    .select(`
      id, full_name, email, phone, created_at,
      enrollments (
        id, status, class_type,
        subjects:subject_id ( name )
      )
    `)
    .eq("role", "student")
    .order("created_at", { ascending: false });

  return (
    <div>
      <RealtimeRefresher tables={["profiles", "enrollments"]} />
      <h1 className="text-2xl font-bold">Students</h1>
      <p className="text-sm text-muted-foreground mt-1">
        {students?.length ?? 0} registered student{students?.length !== 1 ? "s" : ""}
      </p>

      {(!students || students.length === 0) ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No students registered</p>
          <p className="text-sm text-muted-foreground mt-1">Students who sign up will appear here.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {students.map((s) => {
            const enrollments = s.enrollments as unknown as {
              id: string;
              status: string;
              class_type: string | null;
              subjects: { name: string } | null;
            }[];
            const activeEnrollments = (enrollments ?? []).filter(
              (e) => e.status === "approved"
            );

            return (
              <div key={s.id} className="bg-card border border-card-border rounded-xl overflow-hidden">
                <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/60">
                  <div>
                    <p className="font-semibold">{s.full_name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.email} {s.phone ? `· ${s.phone}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Joined {new Date(s.created_at).toLocaleDateString()}</span>
                    <span className="px-2 py-0.5 rounded-full bg-muted font-medium">
                      {activeEnrollments.length} active subject{activeEnrollments.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {enrollments && enrollments.length > 0 ? (
                  <div className="divide-y divide-border/40">
                    {enrollments.map((e) => {
                      const subject = e.subjects as unknown as { name: string } | null;
                      return (
                        <div key={e.id} className="px-5 py-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyle[e.status] ?? "bg-muted text-muted-foreground"}`}>
                              {e.status}
                            </span>
                            <p className="text-sm font-medium truncate">{subject?.name ?? "Unknown subject"}</p>
                            <p className="text-xs text-muted-foreground capitalize hidden sm:block">
                              {e.class_type?.replace("_", " ") ?? ""}
                            </p>
                          </div>
                          {e.status === "approved" && (
                            <form action={revokeEnrollment}>
                              <input type="hidden" name="enrollment_id" value={e.id} />
                              <button
                                className="px-2.5 py-1 rounded-lg text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                              >
                                Revoke
                              </button>
                            </form>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-5 py-3 text-xs text-muted-foreground">No enrollments yet</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
