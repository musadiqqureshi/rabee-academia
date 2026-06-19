import { CalendarDays } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default async function StudentSchedule() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      batch_id,
      batches (
        subjects ( name ),
        profiles ( full_name ),
        schedules ( id, day_of_week, start_time, end_time )
      )
    `)
    .eq("student_id", profile.id)
    .eq("status", "approved");

  type Entry = {
    id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    subject_name: string;
    teacher_name: string | null;
  };

  const allEntries: Entry[] = [];
  for (const e of enrollments ?? []) {
    const batch = e.batches as unknown as {
      subjects: { name: string } | null;
      profiles: { full_name: string | null } | null;
      schedules: { id: string; day_of_week: string; start_time: string; end_time: string }[] | null;
    } | null;
    for (const s of batch?.schedules ?? []) {
      allEntries.push({
        ...s,
        subject_name: batch?.subjects?.name ?? "Unknown",
        teacher_name: batch?.profiles?.full_name ?? null,
      });
    }
  }

  const byDay = DAYS.map((day) => ({
    day,
    entries: allEntries
      .filter((e) => e.day_of_week === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time)),
  })).filter((d) => d.entries.length > 0);

  return (
    <div>
      <h1 className="text-2xl font-bold">Schedule</h1>
      <p className="text-sm text-muted-foreground mt-1">Your weekly class timetable</p>

      {byDay.length === 0 ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No schedule yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your timetable will appear here once your batch schedule is created.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {byDay.map(({ day, entries }) => (
            <div key={day} className="bg-card border border-card-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/30">
                <h2 className="font-semibold text-sm">{day}</h2>
              </div>
              <div className="divide-y divide-border">
                {entries.map((e) => (
                  <div key={e.id} className="px-5 py-3 flex items-center gap-4">
                    <div className="text-sm font-mono text-muted-foreground w-28 shrink-0">
                      {e.start_time} – {e.end_time}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{e.subject_name}</p>
                      {e.teacher_name && (
                        <p className="text-xs text-muted-foreground">{e.teacher_name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
