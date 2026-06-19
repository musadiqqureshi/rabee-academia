import { BookOpen } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import RealtimeRefresher from "@/components/dashboard/RealtimeRefresher";

export const dynamic = "force-dynamic";

export default async function StudentSubjects() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      id, status, class_type, created_at, batch_id,
      subjects:subject_id ( name, level ),
      batches:batch_id (
        id,
        profiles:teacher_id ( full_name ),
        schedules ( day_of_week, start_time, end_time )
      )
    `)
    .eq("student_id", profile.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  return (
    <div>
      <RealtimeRefresher tables={["enrollments"]} />
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
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {enrollments.map((e) => {
            const subject = e.subjects as unknown as { name: string; level: string } | null;
            const batch = e.batches as unknown as {
              profiles: { full_name: string | null } | null;
              schedules: { day_of_week: string; start_time: string; end_time: string }[] | null;
            } | null;

            const teacher = batch?.profiles?.full_name ?? "To be assigned";
            const schedDays = batch?.schedules?.map((s) => s.day_of_week).join(", ") ?? null;
            const schedTime = batch?.schedules?.[0]
              ? `${batch.schedules[0].start_time} – ${batch.schedules[0].end_time}`
              : null;

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
                  {schedDays && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Days</span>
                      <span className="font-medium">{schedDays}</span>
                    </div>
                  )}
                  {schedTime && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time</span>
                      <span className="font-medium">{schedTime}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Enrolled</span>
                    <span className="font-medium">{new Date(e.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    Active
                  </span>
                  {!e.batch_id && (
                    <span className="text-xs text-amber-600">Teacher allocation pending</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
