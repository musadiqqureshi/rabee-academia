import { CalendarDays, Clock, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TeacherSchedule() {
  const profile = await requireRole("teacher");
  const supabase = await createClient();

  // Admins set a per-batch schedule (batches.schedule_text); show it here.
  const { data: batches } = await supabase
    .from("batches")
    .select("id, class_type, schedule_text, subjects ( name ), enrollments ( id )")
    .eq("teacher_id", profile.id)
    .eq("is_active", true);

  const rows = (batches ?? []).map((b) => ({
    subject: (b.subjects as unknown as { name: string } | null)?.name ?? "Subject",
    schedule: (b as { schedule_text: string | null }).schedule_text ?? null,
    classType: b.class_type as string | null,
    students: ((b.enrollments as { id: string }[] | null) ?? []).length,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold">My Schedule</h1>
      <p className="text-sm text-muted-foreground mt-1">Weekly teaching timetable</p>

      {rows.length === 0 ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No schedule yet</p>
          <p className="text-sm text-muted-foreground mt-1">Your schedule appears once the admin sets your batch class times.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rows.map((r, i) => (
            <div key={i} className="bg-card border border-card-border rounded-2xl p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{r.subject}</p>
                {r.classType && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted capitalize">{r.classType}</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 inline-flex items-center gap-1"><Users className="w-3 h-3" /> {r.students} student{r.students !== 1 ? "s" : ""}</p>
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
