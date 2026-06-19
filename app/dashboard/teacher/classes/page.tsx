import { Video, ExternalLink } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherClasses() {
  const profile = await requireRole("teacher");
  const supabase = await createClient();

  const { data: batches } = await supabase
    .from("batches")
    .select(`
      id,
      subjects ( name ),
      schedules ( id, day_of_week, start_time, end_time, meet_link )
    `)
    .eq("teacher_id", profile.id);

  type ScheduleRow = {
    id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    meet_link: string | null;
    subject_name: string;
  };

  const rows: ScheduleRow[] = [];
  for (const b of batches ?? []) {
    const subject = b.subjects as unknown as unknown as { name: string } | null;
    for (const s of (b.schedules as { id: string; day_of_week: string; start_time: string; end_time: string; meet_link: string | null }[] | null) ?? []) {
      rows.push({ ...s, subject_name: subject?.name ?? "Unknown" });
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Class Links</h1>
      <p className="text-sm text-muted-foreground mt-1">Google Meet links for all your scheduled sessions</p>

      {rows.length === 0 ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <Video className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No classes scheduled</p>
          <p className="text-sm text-muted-foreground mt-1">Meet links will appear here once schedules are created.</p>
        </div>
      ) : (
        <div className="mt-6 bg-card border border-card-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Day</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Meet Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{r.subject_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.day_of_week}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono">{r.start_time} – {r.end_time}</td>
                  <td className="px-4 py-3">
                    {r.meet_link ? (
                      <a
                        href={r.meet_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary hover:underline text-xs"
                      >
                        <ExternalLink className="w-3 h-3" /> Open Meet
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Not set</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
