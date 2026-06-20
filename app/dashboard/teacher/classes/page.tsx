import { Video, ExternalLink, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { setBatchMeetLink, setEnrollmentMeetLink } from "./actions";

export const dynamic = "force-dynamic";

export default async function TeacherClasses() {
  const profile = await requireRole("teacher");
  const supabase = await createClient();

  // 1:1 students allotted to this teacher.
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, meet_link, batch_id, student:student_id ( full_name ), subjects:subject_id ( name, slug )")
    .eq("teacher_id", profile.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const oneOnOne = (enrollments ?? []).filter((e) => (e.subjects as unknown as { slug: string } | null)?.slug !== "ai-mastery");

  // AI Mastery is a group class — keep its batch link.
  const { data: masteryBatches } = await supabase
    .from("batches")
    .select("id, meet_link, subjects:subject_id ( name, slug )")
    .eq("teacher_id", profile.id);
  const mastery = (masteryBatches ?? []).filter((b) => (b.subjects as unknown as { slug: string } | null)?.slug === "ai-mastery");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Class Links</h1>
        <p className="text-sm text-muted-foreground mt-1">Give each student their personal one-on-one session link.</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold text-sm">One-on-one sessions</h2>
        {oneOnOne.length === 0 ? (
          <div className="bg-card border border-card-border rounded-xl p-8 text-center">
            <Video className="w-9 h-9 text-muted-foreground mx-auto mb-2" />
            <p className="font-medium">No students yet</p>
            <p className="text-sm text-muted-foreground mt-1">Students allotted to you appear here once approved.</p>
          </div>
        ) : (
          oneOnOne.map((e) => {
            const student = e.student as unknown as { full_name: string | null } | null;
            const subject = e.subjects as unknown as { name: string } | null;
            return (
              <div key={e.id} className="rounded-2xl border border-card-border bg-card shadow-sm p-4">
                <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                  <div>
                    <p className="font-semibold">{student?.full_name ?? "Student"}</p>
                    <p className="text-xs text-muted-foreground">{subject?.name ?? "Subject"} · 1:1 session</p>
                  </div>
                  {e.meet_link && (
                    <a href={e.meet_link} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                      <ExternalLink className="w-4 h-4" /> Open
                    </a>
                  )}
                </div>
                <form action={setEnrollmentMeetLink} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="enrollment_id" value={e.id} />
                  <input name="meet_link" defaultValue={e.meet_link ?? ""} type="url" placeholder="https://meet.google.com/… (this student's link)"
                    className="flex-1 min-w-[220px] rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                  <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">Save link</button>
                </form>
              </div>
            );
          })
        )}
      </section>

      {mastery.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-sm inline-flex items-center gap-2"><Users className="w-4 h-4" /> AI Mastery (group class)</h2>
          {mastery.map((b) => {
            const subject = b.subjects as unknown as { name: string } | null;
            return (
              <div key={b.id} className="rounded-2xl border border-primary/30 bg-primary/5 shadow-sm p-4">
                <p className="font-semibold mb-2">{subject?.name ?? "AI Mastery"} — shared group link</p>
                <form action={setBatchMeetLink} className="flex flex-wrap items-center gap-2">
                  <input type="hidden" name="batch_id" value={b.id} />
                  <input name="meet_link" defaultValue={b.meet_link ?? ""} type="url" placeholder="https://meet.google.com/… (group link)"
                    className="flex-1 min-w-[220px] rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                  <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">Save link</button>
                </form>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
