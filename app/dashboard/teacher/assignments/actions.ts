"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { chatComplete, aiConfigured } from "@/lib/ai";

async function requireTeacher() {
  const profile = await getProfile();
  if (!profile || (profile.role !== "teacher" && profile.role !== "admin" && profile.role !== "super_admin")) {
    throw new Error("Not authorized");
  }
  return profile;
}

// Generate an assignment (title, description, instructions) with AI from a topic.
export async function generateAssignmentWithAI(formData: FormData): Promise<string> {
  const profile = await requireTeacher();
  if (!aiConfigured()) throw new Error("AI is not configured. Set AI_BASE_URL + AI_API_KEY.");
  const supabase = await createClient();

  const batchId = String(formData.get("batch_id") ?? "");
  if (!batchId) throw new Error("A batch is required");
  const topic = String(formData.get("topic") ?? "").trim();
  if (!topic) throw new Error("A topic is required");
  const totalMarks = Math.max(1, Number(formData.get("total_marks") ?? 100) || 100);

  const { data: batch } = await supabase.from("batches").select("subject_id").eq("id", batchId).single();

  const prompt = `Create a homework assignment for students on the topic: "${topic}". Total marks: ${totalMarks}.
Respond ONLY with JSON: {"title":"<short title>","description":"<1-2 sentence summary>","instructions":"<clear step-by-step instructions and the questions/tasks for the student>"}`;

  const text = await chatComplete(
    "You are an expert teacher. Respond with valid JSON only.",
    [{ role: "user", content: prompt }],
    { maxTokens: 2000 },
  );
  const parsed = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));

  const { data: assignment, error } = await supabase
    .from("assignments")
    .insert({
      batch_id: batchId,
      teacher_id: profile.id,
      subject_id: batch?.subject_id ?? null,
      title: String(parsed.title ?? topic).slice(0, 120),
      description: parsed.description ?? null,
      instructions: parsed.instructions ?? null,
      total_marks: totalMarks,
      submission_type: "portal",
      is_published: true,
    })
    .select("id")
    .single();
  if (error || !assignment) throw new Error(error?.message ?? "Failed to create assignment");

  revalidatePath("/dashboard/teacher/assignments");
  return assignment.id as string;
}

export async function createAssignment(formData: FormData) {
  const profile = await requireTeacher();
  const supabase = await createClient();

  const batchId = String(formData.get("batch_id") ?? "");
  if (!batchId) throw new Error("A batch is required");

  // Derive the subject from the batch so the assignment is correctly linked.
  const { data: batch } = await supabase
    .from("batches")
    .select("id, subject_id, teacher_id")
    .eq("id", batchId)
    .single();
  if (!batch) throw new Error("Batch not found");

  const dueRaw = String(formData.get("due_date") ?? "");

  const { error } = await supabase.from("assignments").insert({
    batch_id: batchId,
    teacher_id: profile.id,
    subject_id: batch.subject_id ?? null,
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    instructions: String(formData.get("instructions") ?? "").trim() || null,
    due_date: dueRaw ? new Date(dueRaw).toISOString() : null,
    total_marks: Number(formData.get("total_marks") ?? 100) || 100,
    submission_type: String(formData.get("submission_type") ?? "portal"),
    resource_url: String(formData.get("resource_url") ?? "").trim() || null,
    is_published: true,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/teacher/assignments");
}

export async function gradeSubmission(formData: FormData) {
  const profile = await requireTeacher();
  const supabase = await createClient();

  const submissionId = String(formData.get("submission_id") ?? "");
  const assignmentId = String(formData.get("assignment_id") ?? "");
  const action = String(formData.get("action") ?? "grade"); // 'grade' | 'return'

  const update =
    action === "return"
      ? { status: "returned" as const, feedback: String(formData.get("feedback") ?? "").trim() || null }
      : {
          status: "graded" as const,
          marks_obtained: Number(formData.get("marks_obtained") ?? 0),
          feedback: String(formData.get("feedback") ?? "").trim() || null,
          graded_by: profile.id,
          graded_at: new Date().toISOString(),
        };

  const { error } = await supabase
    .from("assignment_submissions")
    .update(update)
    .eq("id", submissionId);
  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/teacher/assignments/${assignmentId}`);
}
