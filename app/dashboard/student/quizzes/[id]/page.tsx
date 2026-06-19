import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, Clock } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import QuizRunner from "./QuizRunner";
import StartQuizButton from "./StartQuizButton";

export const dynamic = "force-dynamic";

export default async function StudentQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: quiz } = await supabase.from("quizzes").select("*").eq("id", id).single();
  if (!quiz) notFound();

  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("quiz_id", id)
    .eq("student_id", profile.id)
    .order("created_at", { ascending: false });

  const inProgress = attempts?.find((a) => a.status === "in_progress");
  const latest = attempts?.[0];
  const finished = latest && latest.status !== "in_progress" ? latest : null;
  const attemptsUsed = attempts?.filter((a) => a.status !== "in_progress").length ?? 0;
  const canAttempt = attemptsUsed < quiz.attempt_limit;

  // Questions WITHOUT correct answers for the runner.
  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("id, question_type, prompt, options, marks, position")
    .eq("quiz_id", id)
    .order("position", { ascending: true });

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/dashboard/student/quizzes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to quizzes
      </Link>

      <div className="rounded-2xl border border-card-border bg-card shadow-sm p-5">
        <h1 className="text-xl font-bold">{quiz.title}</h1>
        {quiz.description && <p className="text-sm text-foreground/80 mt-1">{quiz.description}</p>}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
          <span>{questions?.length ?? 0} questions · {quiz.total_marks} marks</span>
          <span>Pass: {quiz.passing_score}%</span>
          {quiz.time_limit_minutes && <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {quiz.time_limit_minutes} min</span>}
          <span>Attempts: {attemptsUsed}/{quiz.attempt_limit}</span>
        </div>
      </div>

      {finished && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <Award className="w-5 h-5" />
            {finished.status === "graded"
              ? `Score: ${finished.score}/${finished.max_score ?? quiz.total_marks}`
              : "Submitted — awaiting marking"}
          </div>
          {finished.feedback && <p className="text-sm text-emerald-800/80 mt-2">{finished.feedback}</p>}
        </div>
      )}

      {inProgress ? (
        <QuizRunner
          quizId={id}
          attemptId={inProgress.id}
          questions={(questions ?? []).map((q) => ({
            id: q.id, question_type: q.question_type, prompt: q.prompt,
            options: q.options as never, marks: q.marks,
          }))}
          initialAnswers={(inProgress.answers as Record<string, string>) ?? {}}
          timeLimitMinutes={quiz.time_limit_minutes}
        />
      ) : canAttempt && (questions?.length ?? 0) > 0 ? (
        <StartQuizButton quizId={id} resuming={false} />
      ) : !canAttempt ? (
        <p className="text-sm text-muted-foreground">You have used all your attempts for this quiz.</p>
      ) : (
        <p className="text-sm text-muted-foreground">This quiz has no questions yet.</p>
      )}
    </div>
  );
}
