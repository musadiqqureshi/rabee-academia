"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

async function requireStudent() {
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");
  return profile;
}

// Create (or resume) an in-progress attempt for the quiz.
export async function startAttempt(quizId: string): Promise<string> {
  const profile = await requireStudent();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("quiz_attempts")
    .select("id, status")
    .eq("quiz_id", quizId)
    .eq("student_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing && existing.status === "in_progress") return existing.id;

  const { data, error } = await supabase
    .from("quiz_attempts")
    .insert({ quiz_id: quizId, student_id: profile.id, status: "in_progress", answers: {} })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function saveProgress(attemptId: string, answers: Record<string, string>) {
  await requireStudent();
  const supabase = await createClient();
  const { error } = await supabase.from("quiz_attempts").update({ answers }).eq("id", attemptId);
  if (error) throw new Error(error.message);
}

// Submit: auto-grade objective questions; subjective awaits manual/AI marking.
export async function submitAttempt(attemptId: string, quizId: string, answers: Record<string, string>) {
  await requireStudent();
  const supabase = await createClient();

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("id, question_type, correct_answer, marks")
    .eq("quiz_id", quizId);

  let objectiveScore = 0;
  let hasSubjective = false;
  let maxScore = 0;
  for (const q of questions ?? []) {
    maxScore += q.marks ?? 0;
    if (q.question_type === "mcq" || q.question_type === "true_false") {
      const given = (answers[q.id] ?? "").trim().toLowerCase();
      if (given && given === (q.correct_answer ?? "").trim().toLowerCase()) {
        objectiveScore += q.marks ?? 0;
      }
    } else {
      hasSubjective = true;
    }
  }

  const { error } = await supabase
    .from("quiz_attempts")
    .update({
      answers,
      status: hasSubjective ? "submitted" : "graded",
      score: objectiveScore,
      max_score: maxScore,
      submitted_at: new Date().toISOString(),
      graded_at: hasSubjective ? null : new Date().toISOString(),
    })
    .eq("id", attemptId);
  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/student/quizzes/${quizId}`);
}
