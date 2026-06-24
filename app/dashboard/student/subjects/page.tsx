import { BookOpen, Video } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import RealtimeRefresher from "@/components/dashboard/RealtimeRefresher";

export const dynamic = "force-dynamic";

export default async function StudentSubjects() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  // Keep this query simple so a fragile nested join can never blank the page.
  const { data: allEnrollments } = await supabase
    .from("enrollments")
    .select("id, status, class_type, created_at, batch_id, meet_link, completed, subjects:subject_id ( name, level )")
    .eq("student_id", profile.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  // Completed courses are hidden from the active list (they move to Certificates).
  const enrollments = (allEnrollments ?? []).filter((e) => !e.completed);
  const completedCount = (allEnrollments ?? []).length - enrollments.length;

  // Fetch teacher / meet link for the assigned batches separately (defensive).
  const batchIds = [...new Set((enrollments ?? []).map((e) => e.batch_id).filter(Boolean) as string[])];
  const batchInfo = new Map<string, { teacher: string | null; meet_link: string | null }>();
  if (batchIds.length > 0) {
    const { data: bs } = await supabase
      .from("batches")
      .select("id, meet_link, profiles:teacher_id ( full_name )")
      .in("id", batchIds);
    for (const b of bs ?? []) {
      const t = b.profiles as unknown as { full_name: string | null } | null;
      batchInfo.set(b.id, { teacher: t?.full_name ?? null, meet_link: b.meet_link ?? null });
    }
  }

  return (
    <div>
      <RealtimeRefresher tables={["enrollments"]} />
      <h1 className="text-2xl font-bold">My Subjects</h1>
      <p className="text-sm text-muted-foreground mt-1">Your active enrolled courses</p>

      {completedCount > 0 && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 flex items-center justify-between gap-3 flex-wrap">
          <span>🎓 You&apos;ve completed {completedCount} course{completedCount > 1 ? "s" : ""}.</span>
          <a href="/dashboard/student/certificates" className="font-semibold underline">Get your certificate{completedCount > 1 ? "s" : ""}</a>
        </div>
      )}

      {(!enrollments || enrollments.length === 0) ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No enrolled subjects</p>
          <p className="text-sm text-muted-foreground mt-1">
            Once your enrollment is approved, your subjects will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {enrollments.map((e) => {
            const subject = e.subjects as unknown as { name: string; level: string } | null;
            const info = e.batch_id ? batchInfo.get(e.batch_id) : undefined;
            const teacher = info?.teacher ?? "To be assigned";
            // Prefer the student's personal 1:1 link; fall back to the group/batch link.
            const joinLink = e.meet_link ?? info?.meet_link ?? null;

            return (
              <div key={e.id} className="bg-card border border-card-border rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center text-primary shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{subject?.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">{subject?.level ?? ""}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Class type</span>
                    <span className="capitalize font-medium">{e.class_type?.replace("_", " ") ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Teacher</span>
                    <span className="font-medium">{teacher}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Enrolled</span>
                    <span className="font-medium">{new Date(e.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    Active
                  </span>
                  {joinLink ? (
                    <a href={joinLink} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      <Video className="w-3.5 h-3.5" /> Join class
                    </a>
                  ) : !e.batch_id ? (
                    <span className="text-xs text-amber-600">Teacher allocation pending</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
