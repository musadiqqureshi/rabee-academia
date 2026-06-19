"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import type { QuizQuestionOption } from "@/lib/supabase/types";

async function requireTeacher() {
  const profile = await getProfile();
  if (!profile || !["teacher", "admin", "super_admin"].includes(profile.role)) {
    throw new Error("Not authorized");
  }
  return profile;
}

export async function createQuiz(formData: FormData) {
  const profile = await requireTeacher();
  const supabase = await createClient();

  const batchId = String(formData.get("batch_id") ?? "");
  if (!batchId) throw new Error("A batch is required");

  const { data: batch } = await supabase
    .from("batches").select("id, subject_id").eq("id", batchId).single();
  if (!batch) throw new Error("Batch not found");

  const num = (k: string) => {
    const v = formData.get(k);
    return v === null || v === "" ? null : Number(v);
  };

  const { data, error } = await supabase
    .from("quizzes")
    .insert({
      batch_id: batchId,
      teacher_id: profile.id,
      subject_id: batch.subject_id ?? null,
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || null,
      time_limit_minutes: num("time_limit_minutes"),
      attempt_limit: num("attempt_limit") ?? 1,
      passing_score: num("passing_score") ?? 50,
      randomize_questions: formData.get("randomize_questions") === "on",
      randomize_answers: formData.get("randomize_answers") === "on",
      grading_mode: String(formData.get("grading_mode") ?? "manual"),
      available_from: (formData.get("available_from") as string) ? new Date(String(formData.get("available_from"))).toISOString() : null,
      available_until: (formData.get("available_until") as string) ? new Date(String(formData.get("available_until"))).toISOString() : null,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/teacher/quizzes");
  return data.id as string;
}

async function recalcTotal(quizId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("quiz_questions").select("marks").eq("quiz_id", quizId);
  const total = (data ?? []).reduce((s, q) => s + (q.marks ?? 0), 0);
  await supabase.from("quizzes").update({ total_marks: total }).eq("id", quizId);
}

export async function addQuestion(formData: FormData) {
  await requireTeacher();
  const supabase = await createClient();

  const quizId = String(formData.get("quiz_id") ?? "");
  const type = String(formData.get("question_type") ?? "mcq");

  let options: QuizQuestionOption[] | null = null;
  let correct: string | null = String(formData.get("correct_answer") ?? "").trim() || null;

  if (type === "mcq") {
    const texts = formData.getAll("option_text").map((o) => String(o).trim()).filter(Boolean);
    options = texts.map((t, i) => ({ id: String.fromCharCode(97 + i), text: t }));
    correct = String(formData.get("correct_option") ?? "a");
  } else if (type === "true_false") {
    options = [
      { id: "true", text: "True" },
      { id: "false", text: "False" },
    ];
    correct = String(formData.get("correct_tf") ?? "true");
  }

  const { count } = await supabase
    .from("quiz_questions").select("*", { count: "exact", head: true }).eq("quiz_id", quizId);

  const { error } = await supabase.from("quiz_questions").insert({
    quiz_id: quizId,
    question_type: type,
    prompt: String(formData.get("prompt") ?? "").trim(),
    options,
    correct_answer: correct,
    marks: Number(formData.get("marks") ?? 1) || 1,
    position: count ?? 0,
  });
  if (error) throw new Error(error.message);

  await recalcTotal(quizId);
  revalidatePath(`/dashboard/teacher/quizzes/${quizId}`);
}

export async function deleteQuestion(formData: FormData) {
  await requireTeacher();
  const supabase = await createClient();
  const quizId = String(formData.get("quiz_id") ?? "");
  const id = String(formData.get("question_id") ?? "");
  await supabase.from("quiz_questions").delete().eq("id", id);
  await recalcTotal(quizId);
  revalidatePath(`/dashboard/teacher/quizzes/${quizId}`);
}

export async function togglePublish(formData: FormData) {
  await requireTeacher();
  const supabase = await createClient();
  const quizId = String(formData.get("quiz_id") ?? "");
  const publish = formData.get("publish") === "true";
  await supabase.from("quizzes").update({ is_published: publish }).eq("id", quizId);
  revalidatePath(`/dashboard/teacher/quizzes/${quizId}`);
}

// AI auto-marking: grades subjective answers with Claude, combines with the
// objective subtotal, and writes a final score + feedback. Falls back to a
// clear error if no API key is configured.
export async function aiGradeAttempt(formData: FormData) {
  const profile = await requireTeacher();
  const supabase = await createClient();
  const quizId = String(formData.get("quiz_id") ?? "");
  const attemptId = String(formData.get("attempt_id") ?? "");

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("AI marking is not configured (missing ANTHROPIC_API_KEY).");

  const { data: attempt } = await supabase
    .from("quiz_attempts").select("id, answers").eq("id", attemptId).single();
  const { data: questions } = await supabase
    .from("quiz_questions").select("id, question_type, prompt, correct_answer, marks").eq("quiz_id", quizId).order("position");
  if (!attempt || !questions) throw new Error("Attempt not found");

  const answers = (attempt.answers ?? {}) as Record<string, string>;

  // Objective subtotal (deterministic, never sent to the model).
  let objective = 0;
  const subjective: { id: string; prompt: string; model: string; answer: string; marks: number }[] = [];
  for (const q of questions) {
    if (q.question_type === "mcq" || q.question_type === "true_false") {
      if ((answers[q.id] ?? "").trim().toLowerCase() === (q.correct_answer ?? "").trim().toLowerCase()) {
        objective += q.marks ?? 0;
      }
    } else {
      subjective.push({
        id: q.id, prompt: q.prompt, model: q.correct_answer ?? "",
        answer: answers[q.id] ?? "", marks: q.marks ?? 0,
      });
    }
  }

  let subjectiveScore = 0;
  let feedback = "Objective questions auto-graded.";

  if (subjective.length > 0) {
    const prompt = `You are grading a student quiz. For each question, award an integer score between 0 and its max marks, and give one short feedback sentence. Respond ONLY with JSON: {"items":[{"id":"<id>","score":<int>,"feedback":"<text>"}],"summary":"<one sentence>"}.\n\nQuestions:\n${JSON.stringify(subjective, null, 2)}`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) throw new Error(`AI marking failed (${res.status})`);
    const json = await res.json();
    const text: string = json?.content?.[0]?.text ?? "{}";
    const parsed = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    for (const item of parsed.items ?? []) {
      const q = subjective.find((s) => s.id === item.id);
      if (q) subjectiveScore += Math.max(0, Math.min(q.marks, Number(item.score) || 0));
    }
    feedback = parsed.summary ?? feedback;
  }

  const maxScore = questions.reduce((s, q) => s + (q.marks ?? 0), 0);
  const { error } = await supabase.from("quiz_attempts").update({
    status: "graded",
    score: objective + subjectiveScore,
    max_score: maxScore,
    feedback,
    ai_graded: true,
    graded_by: profile.id,
    graded_at: new Date().toISOString(),
  }).eq("id", attemptId);
  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/teacher/quizzes/${quizId}/attempts`);
}

// Manual grade / override for an attempt (sets final score + feedback).
export async function gradeAttempt(formData: FormData) {
  const profile = await requireTeacher();
  const supabase = await createClient();
  const quizId = String(formData.get("quiz_id") ?? "");
  const attemptId = String(formData.get("attempt_id") ?? "");
  const score = Number(formData.get("score") ?? 0);

  const { error } = await supabase.from("quiz_attempts").update({
    status: "graded",
    score,
    feedback: String(formData.get("feedback") ?? "").trim() || null,
    graded_by: profile.id,
    graded_at: new Date().toISOString(),
  }).eq("id", attemptId);
  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/teacher/quizzes/${quizId}/attempts`);
}
