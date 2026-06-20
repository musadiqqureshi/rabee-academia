"use server";

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

// Marks the student 'present' for today in each of their approved batches.
// Uses ignoreDuplicates so a teacher's existing mark (e.g. absent/late) is
// never overwritten. Best-effort: never throws.
export async function markSelfPresent(): Promise<void> {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "student") return;
    const supabase = await createClient();

    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("batch_id")
      .eq("student_id", profile.id)
      .eq("status", "approved");

    const batchIds = [...new Set((enrollments ?? []).map((e) => e.batch_id).filter(Boolean) as string[])];
    if (batchIds.length === 0) return;

    const today = new Date().toISOString().slice(0, 10);
    const rows = batchIds.map((batch_id) => ({
      batch_id,
      student_id: profile.id,
      session_date: today,
      status: "present",
      marked_by: profile.id,
    }));

    await supabase
      .from("attendance")
      .upsert(rows, { onConflict: "batch_id,student_id,session_date", ignoreDuplicates: true });
  } catch {
    /* attendance-on-login is best-effort */
  }
}
