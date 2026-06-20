import { Video, ExternalLink } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { setBatchMeetLink } from "./actions";

export const dynamic = "force-dynamic";

export default async function TeacherClasses() {
  const profile = await requireRole("teacher");
  const supabase = await createClient();

  const { data: batches } = await supabase
    .from("batches")
    .select("id, class_type, meet_link, subjects:subject_id ( name )")
    .eq("teacher_id", profile.id);

  return (
    <div>
      <h1 className="text-2xl font-bold">Class Links</h1>
      <p className="text-sm text-muted-foreground mt-1">Set the Google Meet link students use to join each class.</p>

      {(!batches || batches.length === 0) ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <Video className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No classes yet</p>
          <p className="text-sm text-muted-foreground mt-1">Once students are allotted to you, your classes appear here.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {batches.map((b) => {
            const subject = b.subjects as unknown as { name: string } | null;
            return (
              <div key={b.id} className="rounded-2xl border border-card-border bg-card shadow-sm p-4">
                <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                  <div>
                    <p className="font-semibold">{subject?.name ?? "Subject"}</p>
                    <p className="text-xs text-muted-foreground capitalize">{b.class_type} class</p>
                  </div>
                  {b.meet_link && (
                    <a href={b.meet_link} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                      <ExternalLink className="w-4 h-4" /> Open
                    </a>
                  )}
                </div>
                <form action={setBatchMeetLink} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="batch_id" value={b.id} />
                  <input name="meet_link" defaultValue={b.meet_link ?? ""} type="url" placeholder="https://meet.google.com/…"
                    className="flex-1 min-w-[220px] rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                  <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">Save link</button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
