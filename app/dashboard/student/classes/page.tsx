import { Video, ExternalLink } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import RealtimeRefresher from "@/components/dashboard/RealtimeRefresher";

export const dynamic = "force-dynamic";

export default async function StudentClasses() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  // Per-student 1:1 link is on the enrolment; AI Mastery uses its batch link.
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, meet_link, batch_id, completed, subjects:subject_id ( name, slug ), teacher:teacher_id ( full_name ), batches:batch_id ( meet_link )")
    .eq("student_id", profile.id)
    .eq("status", "approved");

  const active = (enrollments ?? []).filter((e) => !e.completed);

  // Extra (unlimited) session links the teacher added.
  const enrIds = active.map((e) => e.id);
  const batchIds = [...new Set(active.map((e) => e.batch_id).filter(Boolean) as string[])];
  const { data: extra } = enrIds.length || batchIds.length
    ? await supabase.from("class_links").select("id, label, url, enrollment_id, batch_id")
        .or(`enrollment_id.in.(${enrIds.join(",") || "00000000-0000-0000-0000-000000000000"}),batch_id.in.(${batchIds.join(",") || "00000000-0000-0000-0000-000000000000"})`)
    : { data: [] };
  type CL = { id: string; label: string | null; url: string; enrollment_id: string | null; batch_id: string | null };
  const extraByEnr = new Map<string, CL[]>();
  for (const l of (extra ?? []) as CL[]) {
    const key = l.enrollment_id ?? "";
    const batchMatch = active.find((e) => e.batch_id && e.batch_id === l.batch_id);
    const enrKey = l.enrollment_id ?? batchMatch?.id ?? "";
    if (enrKey) extraByEnr.set(enrKey, [...(extraByEnr.get(enrKey) ?? []), l]);
    void key;
  }

  const rows = active.map((e) => {
    const subject = e.subjects as unknown as { name: string; slug: string } | null;
    const teacher = e.teacher as unknown as { full_name: string | null } | null;
    const batch = e.batches as unknown as { meet_link: string | null } | null;
    const link = subject?.slug === "ai-mastery" ? (batch?.meet_link ?? e.meet_link) : e.meet_link;
    return { id: e.id, name: subject?.name ?? "Subject", teacher: teacher?.full_name ?? null, link, group: subject?.slug === "ai-mastery", extra: extraByEnr.get(e.id) ?? [] };
  });

  return (
    <div>
      <RealtimeRefresher tables={["enrollments"]} />
      <h1 className="text-2xl font-bold">Class Links</h1>
      <p className="text-sm text-muted-foreground mt-1">Your personal one-on-one session links</p>

      {rows.length === 0 ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <Video className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No classes yet</p>
          <p className="text-sm text-muted-foreground mt-1">Your link appears once your enrollment is approved and your teacher shares it.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {rows.map((s) => (
            <div key={s.id} className="bg-card border border-card-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.group ? "Group class" : "1:1 session"}{s.teacher ? ` · ${s.teacher}` : ""}</p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center text-primary shrink-0">
                  <Video className="w-4 h-4" />
                </div>
              </div>
              {s.link ? (
                <a href={s.link} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                  Join Class <ExternalLink className="w-3 h-3" />
                </a>
              ) : s.extra.length === 0 ? (
                <span className="text-xs text-muted-foreground italic">Your teacher hasn&apos;t shared the link yet</span>
              ) : null}

              {s.extra.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/60 space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">More session links</p>
                  {s.extra.map((l) => (
                    <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-primary hover:underline truncate">
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" /> {l.label || "Join session"}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
