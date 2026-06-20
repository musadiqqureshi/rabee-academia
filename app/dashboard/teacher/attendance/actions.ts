"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

// Upsert attendance for a batch on a given date. Expects repeated
// `status_<studentId>` fields ('present' | 'absent' | 'late').
export async function markAttendance(formData: FormData) {
  const profile = await getProfile();
  if (!profile || !["teacher", "admin", "super_admin"].includes(profile.role)) {
    throw new Error("Not authorized");
  }
  const supabase = await createClient();

  const batchId = String(formData.get("batch_id") ?? "");
  const sessionDate = String(formData.get("session_date") ?? "");
  if (!batchId || !sessionDate) throw new Error("Batch and date are required");

  const rows: {
    batch_id: string; student_id: string; session_date: string;
    status: string; marked_by: string;
  }[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("status_")) {
      rows.push({
        batch_id: batchId,
        student_id: key.slice("status_".length),
        session_date: sessionDate,
        status: String(value),
        marked_by: profile.id,
      });
    }
  }
  if (rows.length === 0) return;

  const { error } = await supabase
    .from("attendance")
    .upsert(rows, { onConflict: "batch_id,student_id,session_date" });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/teacher/attendance");
}
