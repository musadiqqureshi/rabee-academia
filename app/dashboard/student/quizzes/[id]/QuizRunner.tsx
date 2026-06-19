"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clock, Save } from "lucide-react";
import { saveProgress, submitAttempt } from "../actions";
import type { QuizQuestionOption, QuizQuestionType } from "@/lib/supabase/types";

interface PublicQuestion {
  id: string;
  question_type: QuizQuestionType;
  prompt: string;
  options: QuizQuestionOption[] | null;
  marks: number;
}

interface Props {
  quizId: string;
  attemptId: string;
  questions: PublicQuestion[];
  initialAnswers: Record<string, string>;
  timeLimitMinutes: number | null;
}

export default function QuizRunner({ quizId, attemptId, questions, initialAnswers, timeLimitMinutes }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(timeLimitMinutes ? timeLimitMinutes * 60 : null);
  const router = useRouter();
  const submittedRef = useRef(false);

  const setAnswer = (qid: string, val: string) => setAnswers((p) => ({ ...p, [qid]: val }));

  function doSubmit() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    startTransition(async () => {
      await submitAttempt(attemptId, quizId, answers);
      router.refresh();
    });
  }

  // Countdown timer with auto-submit.
  useEffect(() => {
    if (remaining === null) return;
    if (remaining <= 0) { doSubmit(); return; }
    const t = setTimeout(() => setRemaining((r) => (r === null ? null : r - 1)), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  function save() {
    setMsg(null);
    startTransition(async () => {
      await saveProgress(attemptId, answers);
      setMsg("Progress saved.");
    });
  }

  const mm = remaining !== null ? Math.floor(remaining / 60) : 0;
  const ss = remaining !== null ? remaining % 60 : 0;

  return (
    <div className="space-y-4">
      {remaining !== null && (
        <div className={`sticky top-2 z-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
          remaining < 60 ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
          <Clock className="w-4 h-4" /> {mm}:{ss.toString().padStart(2, "0")}
        </div>
      )}

      {questions.map((q, i) => (
        <div key={q.id} className="rounded-2xl border border-card-border bg-card shadow-sm p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
            <span>Question {i + 1}</span><span>·</span><span>{q.marks} mark{q.marks > 1 ? "s" : ""}</span>
          </div>
          <p className="font-medium text-sm mb-3">{q.prompt}</p>

          {q.question_type === "mcq" && q.options && (
            <div className="space-y-2">
              {q.options.map((o) => (
                <label key={o.id} className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer text-sm ${
                  answers[q.id] === o.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
                  <input type="radio" name={q.id} checked={answers[q.id] === o.id} onChange={() => setAnswer(q.id, o.id)} />
                  {o.text}
                </label>
              ))}
            </div>
          )}

          {q.question_type === "true_false" && (
            <div className="flex gap-2">
              {["true", "false"].map((v) => (
                <label key={v} className={`flex-1 text-center p-2.5 rounded-lg border cursor-pointer text-sm capitalize ${
                  answers[q.id] === v ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
                  <input type="radio" className="sr-only" name={q.id} checked={answers[q.id] === v} onChange={() => setAnswer(q.id, v)} />
                  {v}
                </label>
              ))}
            </div>
          )}

          {q.question_type === "short_answer" && (
            <input value={answers[q.id] ?? ""} onChange={(e) => setAnswer(q.id, e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Your answer" />
          )}

          {(q.question_type === "long_answer") && (
            <textarea value={answers[q.id] ?? ""} onChange={(e) => setAnswer(q.id, e.target.value)} rows={4}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Write your answer" />
          )}

          {q.question_type === "file_upload" && (
            <input value={answers[q.id] ?? ""} onChange={(e) => setAnswer(q.id, e.target.value)} type="url"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Paste a shared file link" />
          )}
        </div>
      ))}

      {msg && <p className="text-sm text-emerald-600">{msg}</p>}

      <div className="flex gap-2">
        <button onClick={save} disabled={pending}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted disabled:opacity-60">
          <Save className="w-4 h-4" /> Save progress
        </button>
        <button onClick={doSubmit} disabled={pending}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-60">
          {pending ? "Submitting…" : "Submit quiz"}
        </button>
      </div>
    </div>
  );
}
