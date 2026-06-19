import Link from "next/link";
import { ListChecks, ArrowRight, Clock } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StudentQuizzesPage() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("id, title, total_marks, time_limit_minutes, subjects ( name )")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  const ids = quizzes?.map((q) => q.id) ?? [];
  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("quiz_id, status, score, max_score")
    .eq("student_id", profile.id)
    .in("quiz_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);

  const latestByQuiz = new Map<string, { status: string; score: number | null; max_score: number | null }>();
  for (const a of attempts ?? []) {
    if (!latestByQuiz.has(a.quiz_id)) latestByQuiz.set(a.quiz_id, a);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quizzes</h1>
        <p className="text-sm text-muted-foreground mt-1">Take quizzes and view your results.</p>
      </div>

      {quizzes && quizzes.length > 0 ? (
        <div className="grid gap-3">
          {quizzes.map((q) => {
            const a = latestByQuiz.get(q.id);
            const label =
              !a ? "Not attempted"
              : a.status === "graded" ? `${a.score}/${a.max_score ?? q.total_marks}`
              : a.status === "submitted" ? "Awaiting marking"
              : "In progress";
            const style =
              !a ? "bg-muted text-muted-foreground"
              : a.status === "graded" ? "bg-emerald-100 text-emerald-700"
              : a.status === "submitted" ? "bg-blue-100 text-blue-700"
              : "bg-amber-100 text-amber-700";
            return (
              <Link key={q.id} href={`/dashboard/student/quizzes/${q.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-card-border bg-card shadow-sm p-4 hover:shadow-md hover:border-primary/40 transition-all">
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                  <ListChecks className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{q.title}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                    <span>{(q.subjects as unknown as { name: string } | null)?.name ?? "—"}</span>
                    <span>{q.total_marks} marks</span>
                    {q.time_limit_minutes && <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {q.time_limit_minutes} min</span>}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${style}`}>{label}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No quizzes available yet.
        </div>
      )}
    </div>
  );
}
