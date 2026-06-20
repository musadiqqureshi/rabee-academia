import { Video, ExternalLink } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminClasses() {
  await requireRole("admin");
  const supabase = await createClient();

  // Per-student 1:1 sessions.
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, meet_link, student:student_id ( full_name ), teacher:teacher_id ( full_name ), subjects:subject_id ( name, slug ), batches:batch_id ( meet_link )")
    .eq("status", "approved");

  const rows = (enrollments ?? []).map((e) => {
    const subject = e.subjects as unknown as { name: string; slug: string } | null;
    const student = e.student as unknown as { full_name: string | null } | null;
    const teacher = e.teacher as unknown as { full_name: string | null } | null;
    const batch = e.batches as unknown as { meet_link: string | null } | null;
    const group = subject?.slug === "ai-mastery";
    const link = group ? (batch?.meet_link ?? e.meet_link) : e.meet_link;
    return { id: e.id, subject: subject?.name ?? "Subject", student: student?.full_name ?? "Student", teacher: teacher?.full_name ?? "Unassigned", link, group };
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Class Links</h1>
      <p className="text-sm text-muted-foreground mt-1">See whether each teacher has shared a class link, and join to verify the class is running.</p>

      {rows.length === 0 ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <Video className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No active classes yet</p>
          <p className="text-sm text-muted-foreground mt-1">Classes appear once enrollments are approved.</p>
        </div>
      ) : (
        <div className="mt-6 bg-card border border-card-border rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Teacher</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Class link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{r.student}</td>
                  <td className="px-4 py-3">{r.subject}{r.group && <span className="ml-1 text-xs text-primary">(group)</span>}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.teacher}</td>
                  <td className="px-4 py-3">
                    {r.link ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">Link shared</span>
                        <a href={r.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline text-xs">
                          <ExternalLink className="w-3.5 h-3.5" /> Join &amp; check
                        </a>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">No link yet</span>
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
