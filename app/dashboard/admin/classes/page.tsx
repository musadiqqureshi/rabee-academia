import { Video, ExternalLink } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminClasses() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: schedules } = await supabase
    .from("schedules")
    .select(`
      id, day_of_week, start_time, end_time, meet_link,
      batches (
        class_type,
        subjects ( name ),
        profiles ( full_name )
      )
    `)
    .order("day_of_week");

  return (
    <div>
      <h1 className="text-2xl font-bold">Class Links</h1>
      <p className="text-sm text-muted-foreground mt-1">All scheduled classes and their Google Meet links</p>

      {(!schedules || schedules.length === 0) ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <Video className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No classes scheduled</p>
          <p className="text-sm text-muted-foreground mt-1">Schedules will appear here once batches are created.</p>
        </div>
      ) : (
        <div className="mt-6 bg-card border border-card-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Teacher</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Day</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Meet Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {schedules.map((s) => {
                const batch = s.batches as unknown as {
                  class_type: string | null;
                  subjects: { name: string } | null;
                  profiles: { full_name: string | null } | null;
                } | null;
                return (
                  <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{batch?.subjects?.name ?? "—"}</td>
                    <td className="px-4 py-3">{batch?.profiles?.full_name ?? "—"}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{batch?.class_type?.replace("_", " ") ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.day_of_week}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{s.start_time} – {s.end_time}</td>
                    <td className="px-4 py-3">
                      {s.meet_link ? (
                        <a href={s.meet_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline text-xs">
                          <ExternalLink className="w-3 h-3" /> Open
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Not set</span>
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
