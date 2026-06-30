import { CalendarDays, Clock, User } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StudentSchedule() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  // Admins set a per-batch schedule (batches.schedule_text); show it here.
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("batch_id, class_type, batches ( schedule_text, subjects ( name ), profiles:teacher_id ( full_name ) )")
    .eq("student_id", profile.id)
    .eq("status", "approved");

  const rows = (enrollments ?? []).map((e) => {
    const b = e.batches as unknown as {
      schedule_text: string | null;
      subjects: { name: string } | null;
      profiles: { full_name: string | null } | null;
    } | null;
    return {
      subject: b?.subjects?.name ?? "Subject",
      teacher: b?.profiles?.full_name ?? null,
      schedule: b?.schedule_text ?? null,
      classType: e.class_type as string | null,
    };
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Schedule</h1>
      <p className="text-sm text-muted-foreground mt-1">Your weekly class timetable</p>

      {rows.length === 0 ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No schedule yet</p>
          <p className="text-sm text-muted-foreground mt-1">Your timetable appears here once your enrollment is approved and the admin sets your class times.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rows.map((r, i) => (
            <div key={i} className="bg-card border border-card-border rounded-2xl p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{r.subject}</p>
                  {r.teacher && <p className="text-xs text-muted-foreground mt-0.5 inline-flex items-center gap-1"><User className="w-3 h-3" /> {r.teacher}</p>}
                </div>
                {r.classType && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted capitalize">{r.classType}</span>}
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                {r.schedule
                  ? <span className="font-medium">{r.schedule}</span>
                  : <span className="text-muted-foreground">Class times to be announced</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
