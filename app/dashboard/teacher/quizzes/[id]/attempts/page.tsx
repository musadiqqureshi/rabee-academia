import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { QUIZ_QUESTION_TYPE_LABEL, type QuizQuestionType } from "@/lib/supabase/types";
import { aiGradeAttempt, gradeAttempt } from "../../actions";

// Student profile names aren't always readable by a teacher under RLS (the
// embedded join blanks to "Student"). Resolve them with the service role.
async function resolveNames(ids: string[]): Promise<Map<string, { full_name: string | null; student_code: string | null }>> {
  const out = new Map<string, { full_name: string | null; student_code: string | null }>();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || ids.length === 0) return out;
  const admin = createAdminClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data } = await admin.from("profiles").select("id, full_name, student_code").in("id", ids);
  for (const p of data ?? []) out.set(p.id as string, { full_name: p.full_name, student_code: p.student_code });
  return out;
}

export const dynamic = "force-dynamic";

export default async function QuizAttemptsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole("teacher");
  const supabase = await createClient();

  const { data: quiz } = await supabase.from("quizzes").select("*").eq("id", id).single();
  if (!quiz) notFound();

  const { data: questions } = await supabase
    .from("quiz_questions").select("id, question_type, prompt, correct_answer, marks")
    .eq("quiz_id", id).order("position");

  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("*, profiles:student_id ( full_name, student_code )")
    .eq("quiz_id", id)
    .neq("status", "in_progress")
    .order("submitted_at", { ascending: false });

  const names = await resolveNames([...new Set((attempts ?? []).map((a) => a.student_id as string).filter(Boolean))]);

  return (
    <div className="space-y-6">
      <Link href={`/dashboard/teacher/quizzes/${id}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to quiz
      </Link>

      <h1 className="text-xl font-bold">{quiz.title} — Attempts</h1>

      {(attempts ?? []).length === 0 && (
        <p className="text-sm text-muted-foreground">No submitted attempts yet.</p>
      )}

      {(attempts ?? []).map((a) => {
        const joined = a.profiles as unknown as { full_name: string | null; student_code: string | null } | null;
        const p = names.get(a.student_id as string) ?? joined;
        const answers = (a.answers ?? {}) as Record<string, string>;
        return (
          <div key={a.id} className="rounded-2xl border border-card-border bg-card shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-semibold">{p?.full_name ?? "Student"}</p>
                <p className="text-xs text-muted-foreground">{p?.student_code ?? ""}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                a.status === "graded" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                {a.status === "graded"
                  ? `Graded · ${a.score}/${a.max_score ?? quiz.total_marks}${a.ai_graded ? " (AI)" : ""}`
                  : "Awaiting marking"}
              </span>
            </div>

            <div className="space-y-2">
              {(questions ?? []).map((q, i) => {
                const given = answers[q.id] ?? "—";
                const objective = q.question_type === "mcq" || q.question_type === "true_false";
                const correct = objective && given.trim().toLowerCase() === (q.correct_answer ?? "").trim().toLowerCase();
                return (
                  <div key={q.id} className="text-sm border-b border-border/50 pb-2 last:border-0">
                    <p className="text-xs text-muted-foreground">{QUIZ_QUESTION_TYPE_LABEL[q.question_type as QuizQuestionType]} · {q.marks} mark{q.marks > 1 ? "s" : ""}</p>
                    <p className="font-medium">{i + 1}. {q.prompt}</p>
                    <p className={objective ? (correct ? "text-emerald-600" : "text-destructive") : "text-foreground/80"}>
                      Answer: {given}{objective ? (correct ? " ✓" : ` ✗ (correct: ${q.correct_answer})`) : ""}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-end gap-3 pt-1 border-t border-border/50">
              <form action={gradeAttempt} className="flex flex-wrap items-end gap-3">
                <input type="hidden" name="quiz_id" value={id} />
                <input type="hidden" name="attempt_id" value={a.id} />
                <label className="block">
                  <span className="block text-xs text-muted-foreground mb-1">Final score (/{quiz.total_marks})</span>
                  <input type="number" name="score" min={0} max={quiz.total_marks} defaultValue={a.score ?? 0}
                    className="w-28 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                </label>
                <label className="block flex-1 min-w-[180px]">
                  <span className="block text-xs text-muted-foreground mb-1">Feedback</span>
                  <input name="feedback" defaultValue={a.feedback ?? ""}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                </label>
                <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">
                  Save grade
                </button>
              </form>
              <form action={aiGradeAttempt}>
                <input type="hidden" name="quiz_id" value={id} />
                <input type="hidden" name="attempt_id" value={a.id} />
                <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-primary/40 text-primary text-sm font-semibold hover:bg-primary/5">
                  <Sparkles className="w-4 h-4" /> AI grade
                </button>
              </form>
            </div>
          </div>
        );
      })}
    </div>
  );
}
