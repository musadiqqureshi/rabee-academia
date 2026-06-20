import { Video, ExternalLink } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { setBatchMeetLink } from "../../teacher/classes/actions";

export const dynamic = "force-dynamic";

export default async function AdminClasses() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: batches } = await supabase
    .from("batches")
    .select("id, class_type, meet_link, subjects:subject_id ( name ), profiles:teacher_id ( full_name )")
    .eq("is_active", true);

  return (
    <div>
      <h1 className="text-2xl font-bold">Class Links</h1>
      <p className="text-sm text-muted-foreground mt-1">Manage Google Meet links for every class.</p>

      {(!batches || batches.length === 0) ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <Video className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No classes yet</p>
          <p className="text-sm text-muted-foreground mt-1">Classes appear once enrollments are approved.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {batches.map((b) => {
            const subject = b.subjects as unknown as { name: string } | null;
            const teacher = b.profiles as unknown as { full_name: string | null } | null;
            return (
              <div key={b.id} className="rounded-2xl border border-card-border bg-card shadow-sm p-4">
                <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                  <div>
                    <p className="font-semibold">{subject?.name ?? "Subject"}</p>
                    <p className="text-xs text-muted-foreground capitalize">{b.class_type} · {teacher?.full_name ?? "Unassigned"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {b.meet_link ? (
                      <>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                          Link set by {teacher?.full_name ?? "teacher"}
                        </span>
                        <a href={b.meet_link} target="_blank" rel="noopener noreferrer"
                           className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                          <ExternalLink className="w-4 h-4" /> Join &amp; check
                        </a>
                      </>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                        No link yet
                      </span>
                    )}
                  </div>
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
