import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { QUIZ_QUESTION_TYPE_LABEL, type QuizQuestionOption, type QuizQuestionType } from "@/lib/supabase/types";
import QuestionBuilder from "./QuestionBuilder";
import { deleteQuestion, togglePublish } from "../actions";

export const dynamic = "force-dynamic";

export default async function QuizDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole("teacher");
  const supabase = await createClient();

  const { data: quiz } = await supabase.from("quizzes").select("*").eq("id", id).single();
  if (!quiz) notFound();

  const { data: questions } = await supabase
    .from("quiz_questions").select("*").eq("quiz_id", id).order("position", { ascending: true });

  const { count: attemptCount } = await supabase
    .from("quiz_attempts").select("*", { count: "exact", head: true }).eq("quiz_id", id);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/teacher/quizzes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to quizzes
      </Link>

      <div className="rounded-2xl border border-card-border bg-card shadow-sm p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{quiz.title}</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
            <span>{questions?.length ?? 0} questions · {quiz.total_marks} marks</span>
            <span>Pass: {quiz.passing_score}%</span>
            <span>{quiz.time_limit_minutes ? `${quiz.time_limit_minutes} min` : "No time limit"}</span>
            <span className="capitalize">{quiz.grading_mode === "ai" ? "AI marking" : "Manual marking"}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/teacher/quizzes/${id}/attempts`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted">
            <Users className="w-4 h-4" /> Attempts ({attemptCount ?? 0})
          </Link>
          <form action={togglePublish}>
            <input type="hidden" name="quiz_id" value={id} />
            <input type="hidden" name="publish" value={(!quiz.is_published).toString()} />
            <button className={`px-3 py-2 rounded-lg text-sm font-semibold ${
              quiz.is_published ? "border border-border hover:bg-muted" : "bg-primary text-primary-foreground hover:opacity-90"}`}>
              {quiz.is_published ? "Unpublish" : "Publish"}
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-3">
        {(questions ?? []).map((q, i) => (
          <div key={q.id} className="rounded-2xl border border-card-border bg-card shadow-sm p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-muted">{QUIZ_QUESTION_TYPE_LABEL[q.question_type as QuizQuestionType]}</span>
                  <span>{q.marks} mark{q.marks > 1 ? "s" : ""}</span>
                </div>
                <p className="font-medium text-sm">{i + 1}. {q.prompt}</p>
                {q.options && (
                  <ul className="mt-2 space-y-1 text-sm">
                    {(q.options as QuizQuestionOption[]).map((o) => (
                      <li key={o.id} className={`flex items-center gap-2 ${q.correct_answer === o.id ? "text-emerald-600 font-medium" : "text-foreground/70"}`}>
                        <span className="uppercase text-xs w-4">{o.id}.</span> {o.text}
                        {q.correct_answer === o.id && <span className="text-xs">✓ correct</span>}
                      </li>
                    ))}
                  </ul>
                )}
                {!q.options && q.correct_answer && (
                  <p className="mt-1.5 text-xs text-muted-foreground">Model answer: {q.correct_answer}</p>
                )}
              </div>
              <form action={deleteQuestion}>
                <input type="hidden" name="quiz_id" value={id} />
                <input type="hidden" name="question_id" value={q.id} />
                <button className="p-1.5 text-muted-foreground hover:text-destructive" aria-label="Delete question">
                  <Trash2 className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      <QuestionBuilder quizId={id} />
    </div>
  );
}
