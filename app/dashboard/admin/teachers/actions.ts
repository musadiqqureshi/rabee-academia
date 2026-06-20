"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

export async function setTeacherSubjects(teacherId: string, subjectIds: string[]) {
  const profile = await getProfile();
  if (!profile || !["admin", "super_admin"].includes(profile.role)) throw new Error("Not authorized");
  const supabase = await createClient();

  // Replace the teacher's subject assignments.
  await supabase.from("teacher_subjects").delete().eq("teacher_id", teacherId);
  if (subjectIds.length > 0) {
    await supabase.from("teacher_subjects").insert(
      subjectIds.map((subject_id) => ({ teacher_id: teacherId, subject_id })),
    );
  }
  revalidatePath("/dashboard/admin/teachers");
}
