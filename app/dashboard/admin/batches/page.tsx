import { BookOpen } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import AddBatchForm from "./AddBatchForm";

export const dynamic = "force-dynamic";

export default async function AdminBatches() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: batches } = await supabase
    .from("batches")
    .select(`
      id, class_type, start_date, end_date, max_students, is_active,
      subjects ( name, level ),
      profiles ( full_name ),
      enrollments ( id )
    `)
    .order("start_date", { ascending: false });

  const { data: subjects } = await supabase.from("subjects").select("id, name").eq("is_active", true).order("name");
  const { data: teachers } = await supabase.from("profiles").select("id, full_name, email").eq("role", "teacher");
  const subjectOpts = (subjects ?? []).map((s) => ({ id: s.id, name: s.name }));
  const teacherOpts = (teachers ?? []).map((t) => ({ id: t.id, name: t.full_name ?? t.email ?? "Teacher" }));

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Batches</h1>
          <p className="text-sm text-muted-foreground mt-1">All class batches on the platform</p>
        </div>
        <AddBatchForm subjects={subjectOpts} teachers={teacherOpts} />
      </div>

      {(!batches || batches.length === 0) ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No batches yet</p>
          <p className="text-sm text-muted-foreground mt-1">Create a batch to assign students to a teacher and subject.</p>
        </div>
      ) : (
        <div className="mt-6 bg-card border border-card-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Teacher</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Class Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Students</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Start Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">End Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {batches.map((b) => {
                const subject = b.subjects as unknown as { name: string; level: string } | null;
                const teacher = b.profiles as unknown as { full_name: string | null } | null;
                const enrolled = (b.enrollments as { id: string }[] | null)?.length ?? 0;
                return (
                  <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium">{subject?.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground capitalize">{subject?.level}</p>
                    </td>
                    <td className="px-4 py-3">{teacher?.full_name ?? "—"}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{b.class_type?.replace("_", " ") ?? "—"}</td>
                    <td className="px-4 py-3">{enrolled} / {b.max_students ?? "∞"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.start_date ? new Date(b.start_date).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.end_date ? new Date(b.end_date).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${b.is_active ? "bg-green-500/15 text-green-400" : "bg-muted text-muted-foreground"}`}>
                        {b.is_active ? "Active" : "Inactive"}
                      </span>
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
