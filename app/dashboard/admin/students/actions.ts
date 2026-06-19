"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

async function requireStaff() {
  const profile = await getProfile();
  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    throw new Error("Not authorized");
  }
  return profile;
}

export async function revokeEnrollment(formData: FormData) {
  await requireStaff();
  const supabase = await createClient();
  const id = String(formData.get("enrollment_id") ?? "");

  await supabase
    .from("enrollments")
    .update({ status: "cancelled" })
    .eq("id", id);

  await supabase
    .from("payments")
    .update({ status: "refunded" })
    .eq("enrollment_id", id);

  revalidatePath("/dashboard/admin/students");
  revalidatePath("/dashboard/admin/enrollments");
  revalidatePath("/dashboard/student/subjects");
}
