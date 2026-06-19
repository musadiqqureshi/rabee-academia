import Link from "next/link";
import { ClipboardList, Calendar, Users, ArrowRight } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import CreateAssignmentForm from "./CreateAssignmentForm";

export const dynamic = "force-dynamic";

export default async function TeacherAssignmentsPage() {
  const profile = await requireRole("teacher");
  const supabase = await createClient();

  const { data: batches } = await supabase
    .from("batches")
    .select("id, class_type, subjects ( name )")
    .eq("teacher_id", profile.id);

  const batchOptions =
    batches?.map((b) => ({
      id: b.id,
      label: `${(b.subjects as unknown as { name: string } | null)?.name ?? "Subject"} · ${b.class_type}`,
    })) ?? [];

  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, title, due_date, total_marks, submission_type, batch_id, subjects ( name )")
    .eq("teacher_id", profile.id)
    .order("created_at", { ascending: false });

  const ids = assignments?.map((a) => a.id) ?? [];
  const { data: subs } = await supabase
    .from("assignment_submissions")
    .select("assignment_id, status")
    .in("assignment_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);

  const counts = new Map<string, { total: number; graded: number }>();
  for (const s of subs ?? []) {
    const c = counts.get(s.assignment_id) ?? { total: 0, graded: 0 };
    c.total += 1;
    if (s.status === "graded") c.graded += 1;
    counts.set(s.assignment_id, c);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assignments</h1>
        <p className="text-sm text-muted-foreground mt-1">Create assignments and review student submissions.</p>
      </div>

      <CreateAssignmentForm batches={batchOptions} />

      {assignments && assignments.length > 0 ? (
        <div className="grid gap-3">
          {assignments.map((a) => {
            const c = counts.get(a.id) ?? { total: 0, graded: 0 };
            return (
              <Link
                key={a.id}
                href={`/dashboard/teacher/assignments/${a.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-card-border bg-card shadow-sm p-4 hover:shadow-md hover:border-primary/40 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{a.title}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                    <span>{(a.subjects as unknown as { name: string } | null)?.name ?? "—"}</span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {a.due_date ? new Date(a.due_date).toLocaleDateString() : "No due date"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {c.total} submitted · {c.graded} graded
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-muted text-foreground/70 capitalize">
                      {a.submission_type.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No assignments yet. Create your first one above.
        </div>
      )}
    </div>
  );
}
