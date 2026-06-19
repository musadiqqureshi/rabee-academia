import Link from "next/link";
import { ClipboardList, Calendar, ArrowRight } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SUBMISSION_STATUS_LABEL, type SubmissionStatus } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const statusStyle: Record<SubmissionStatus | "pending", string> = {
  pending: "bg-muted text-muted-foreground",
  draft: "bg-amber-100 text-amber-700",
  submitted: "bg-blue-100 text-blue-700",
  graded: "bg-emerald-100 text-emerald-700",
  returned: "bg-orange-100 text-orange-700",
};

export default async function StudentAssignmentsPage() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, title, due_date, total_marks, subjects ( name )")
    .order("due_date", { ascending: true });

  const ids = assignments?.map((a) => a.id) ?? [];
  const { data: mySubs } = await supabase
    .from("assignment_submissions")
    .select("assignment_id, status, marks_obtained")
    .eq("student_id", profile.id)
    .in("assignment_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);

  const subMap = new Map((mySubs ?? []).map((s) => [s.assignment_id, s]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Assignments</h1>
        <p className="text-sm text-muted-foreground mt-1">View, submit, and track feedback on your work.</p>
      </div>

      {assignments && assignments.length > 0 ? (
        <div className="grid gap-3">
          {assignments.map((a) => {
            const s = subMap.get(a.id);
            const status = (s?.status ?? "pending") as SubmissionStatus | "pending";
            const overdue = a.due_date && new Date(a.due_date) < new Date() && status === "pending";
            return (
              <Link
                key={a.id}
                href={`/dashboard/student/assignments/${a.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-card-border bg-card shadow-sm p-4 hover:shadow-md hover:border-primary/40 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{a.title}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                    <span>{(a.subjects as unknown as { name: string } | null)?.name ?? "—"}</span>
                    <span className={`inline-flex items-center gap-1 ${overdue ? "text-destructive font-medium" : ""}`}>
                      <Calendar className="w-3 h-3" />
                      {a.due_date ? new Date(a.due_date).toLocaleDateString() : "No due date"}
                      {overdue ? " · overdue" : ""}
                    </span>
                    {status === "graded" && s?.marks_obtained != null && (
                      <span className="font-medium text-foreground">{s.marks_obtained}/{a.total_marks}</span>
                    )}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${statusStyle[status]}`}>
                  {status === "pending" ? "To do" : SUBMISSION_STATUS_LABEL[status as SubmissionStatus]}
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No assignments yet. Check back soon.
        </div>
      )}
    </div>
  );
}
