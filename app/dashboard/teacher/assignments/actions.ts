"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

async function requireTeacher() {
  const profile = await getProfile();
  if (!profile || (profile.role !== "teacher" && profile.role !== "admin" && profile.role !== "super_admin")) {
    throw new Error("Not authorized");
  }
  return profile;
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
