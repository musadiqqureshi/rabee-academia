import type { SupabaseClient } from "@supabase/supabase-js";

export interface Performance {
  attendance: number | null; // %
  assignments: number | null; // %
  quizzes: number | null; // %
  overall: number; // % (average of available components)
  components: number;
}

export const CERT_THRESHOLD = 70;

// Computes a student's overall performance for a given batch from attendance,
// graded assignments, and graded quizzes. Each component is a percentage; the
// overall is the average of whichever components have data.
export async function computeOverall(
  supabase: SupabaseClient,
  studentId: string,
  batchId: string | null,
): Promise<Performance> {
  if (!batchId) return { attendance: null, assignments: null, quizzes: null, overall: 0, components: 0 };

  // Attendance.
  const { data: att } = await supabase
    .from("attendance").select("status").eq("student_id", studentId).eq("batch_id", batchId);
  const attendance = att && att.length
    ? Math.round((att.filter((a) => a.status === "present").length / att.length) * 100)
    : null;

  // Assignments in this batch + the student's graded submissions.
  const { data: assignments } = await supabase
    .from("assignments").select("id, total_marks").eq("batch_id", batchId);
  const aIds = (assignments ?? []).map((a) => a.id);
  let assignmentsPct: number | null = null;
  if (aIds.length) {
    const { data: subs } = await supabase
      .from("assignment_submissions")
      .select("assignment_id, marks_obtained, status")
      .eq("student_id", studentId).in("assignment_id", aIds).eq("status", "graded");
    const totalsById = new Map((assignments ?? []).map((a) => [a.id, a.total_marks || 0]));
    const graded = (subs ?? []).filter((s) => s.marks_obtained != null);
    if (graded.length) {
      const ratios = graded.map((s) => {
        const tot = totalsById.get(s.assignment_id) || 0;
        return tot > 0 ? Math.min(1, (s.marks_obtained ?? 0) / tot) : 0;
      });
      assignmentsPct = Math.round((ratios.reduce((x, y) => x + y, 0) / ratios.length) * 100);
    }
  }

  // Quizzes in this batch + the student's graded attempts.
  const { data: quizzes } = await supabase.from("quizzes").select("id").eq("batch_id", batchId);
  const qIds = (quizzes ?? []).map((q) => q.id);
  let quizzesPct: number | null = null;
  if (qIds.length) {
    const { data: attempts } = await supabase
      .from("quiz_attempts")
      .select("score, max_score, status")
      .eq("student_id", studentId).in("quiz_id", qIds).eq("status", "graded");
    const valid = (attempts ?? []).filter((a) => a.score != null && (a.max_score ?? 0) > 0);
    if (valid.length) {
      const ratios = valid.map((a) => Math.min(1, (a.score ?? 0) / (a.max_score ?? 1)));
      quizzesPct = Math.round((ratios.reduce((x, y) => x + y, 0) / ratios.length) * 100);
    }
  }

  const parts = [attendance, assignmentsPct, quizzesPct].filter((p): p is number => p != null);
  const overall = parts.length ? Math.round(parts.reduce((x, y) => x + y, 0) / parts.length) : 0;

  return { attendance, assignments: assignmentsPct, quizzes: quizzesPct, overall, components: parts.length };
}
