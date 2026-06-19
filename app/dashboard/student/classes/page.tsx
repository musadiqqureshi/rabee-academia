import { Video, ExternalLink } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default async function StudentClasses() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      batch_id,
      batches (
        subjects ( name ),
        profiles ( full_name ),
        schedules ( id, day_of_week, start_time, end_time, meet_link )
      )
    `)
    .eq("student_id", profile.id)
    .eq("status", "approved");

  type ScheduleEntry = {
    id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    meet_link: string | null;
    subject_name: string;
  };

  const schedules: ScheduleEntry[] = [];
  for (const e of enrollments ?? []) {
    const batch = e.batches as unknown as {
      subjects: { name: string } | null;
      profiles: { full_name: string | null } | null;
      schedules: { id: string; day_of_week: string; start_time: string; end_time: string; meet_link: string | null }[] | null;
    } | null;
    for (const s of batch?.schedules ?? []) {
      schedules.push({ ...s, subject_name: batch?.subjects?.name ?? "Unknown" });
    }
  }

  schedules.sort((a, b) => DAYS.indexOf(a.day_of_week) - DAYS.indexOf(b.day_of_week));

  return (
    <div>
      <h1 className="text-2xl font-bold">Class Links</h1>
      <p className="text-sm text-muted-foreground mt-1">Google Meet links for your enrolled subjects</p>

      {schedules.length === 0 ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <Video className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No classes scheduled yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Class links will appear here once your enrollment is approved and schedules are set.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {schedules.map((s) => (
            <div key={s.id} className="bg-card border border-card-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="font-semibold">{s.subject_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.day_of_week}</p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center text-primary shrink-0">
                  <Video className="w-4 h-4" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {s.start_time} – {s.end_time}
              </p>
              {s.meet_link ? (
                <a
                  href={s.meet_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Join Class <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-xs text-muted-foreground italic">Meet link not set yet</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
