import { CalendarDays } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default async function TeacherSchedule() {
  const profile = await requireRole("teacher");
  const supabase = await createClient();

  const { data: batches } = await supabase
    .from("batches")
    .select(`
      id,
      subjects ( name ),
      enrollments ( id ),
      schedules ( id, day_of_week, start_time, end_time )
    `)
    .eq("teacher_id", profile.id)
    .eq("is_active", true);

  type Entry = {
    id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    subject_name: string;
    student_count: number;
  };

  const entries: Entry[] = [];
  for (const b of batches ?? []) {
    const subject = b.subjects as unknown as { name: string } | null;
    const enrollments = b.enrollments as { id: string }[] | null;
    for (const s of (b.schedules as { id: string; day_of_week: string; start_time: string; end_time: string }[] | null) ?? []) {
      entries.push({
        ...s,
        subject_name: subject?.name ?? "Unknown",
        student_count: enrollments?.length ?? 0,
      });
    }
  }

  const byDay = DAYS.map((day) => ({
    day,
    entries: entries
      .filter((e) => e.day_of_week === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time)),
  })).filter((d) => d.entries.length > 0);

  return (
    <div>
      <h1 className="text-2xl font-bold">My Schedule</h1>
      <p className="text-sm text-muted-foreground mt-1">Weekly teaching timetable</p>

      {byDay.length === 0 ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No schedule yet</p>
          <p className="text-sm text-muted-foreground mt-1">Your schedule will appear once admin sets up batch times.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {byDay.map(({ day, entries: dayEntries }) => (
            <div key={day} className="bg-card border border-card-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/30">
                <h2 className="font-semibold text-sm">{day}</h2>
              </div>
              <div className="divide-y divide-border">
                {dayEntries.map((e) => (
                  <div key={e.id} className="px-5 py-3 flex items-center gap-4">
                    <div className="text-sm font-mono text-muted-foreground w-28 shrink-0">
                      {e.start_time} – {e.end_time}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{e.subject_name}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {e.student_count} student{e.student_count !== 1 ? "s" : ""}
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
