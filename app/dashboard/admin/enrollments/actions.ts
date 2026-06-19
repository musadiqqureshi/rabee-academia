"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export async function approveEnrollment(enrollmentId: string) {
  const profile = await requireRole("admin");
  const supabase = await createClient();

  const { error } = await supabase
    .from("enrollments")
    .update({
      status: "approved",
      approved_by: profile.id,
      approved_at: new Date().toISOString(),
    })
    .eq("id", enrollmentId);

  if (error) throw new Error("Failed to approve enrollment");
  revalidatePath("/dashboard/admin/enrollments");
}

export async function rejectEnrollment(enrollmentId: string) {
  await requireRole("admin");
  const supabase = await createClient();

  const { error } = await supabase
    .from("enrollments")
    .update({ status: "rejected" })
    .eq("id", enrollmentId);

  if (error) throw new Error("Failed to reject enrollment");
  revalidatePath("/dashboard/admin/enrollments");
}
