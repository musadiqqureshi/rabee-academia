"use server";

import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { notifyMany } from "@/lib/notify";

const LINK_TITLE = "Your class link is ready 🎥";
const LINK_BODY = "Your teacher added a class link. Open your portal to join the class.";

// Service-role client — teacher RLS can silently block writes to batches/
// enrollments/class_links (a blocked update returns 0 rows with NO error, so the
// link appears "saved" but isn't). We verify ownership ourselves, then write.
function svc() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createAdminClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function revalidateAll() {
  revalidatePath("/dashboard/teacher/classes");
  revalidatePath("/dashboard/admin/classes");
  revalidatePath("/dashboard/student/classes");
  revalidatePath("/dashboard/student/subjects");
}

// Set the Google Meet link for a batch (group class).
export async function setBatchMeetLink(formData: FormData) {
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");
  const isAdmin = ["admin", "super_admin"].includes(profile.role);
  const admin = svc();
  if (!admin) throw new Error("Server not configured (SUPABASE_SERVICE_ROLE_KEY).");

  const batchId = String(formData.get("batch_id") ?? "");
  const link = String(formData.get("meet_link") ?? "").trim() || null;
  if (!batchId) throw new Error("Batch required");

  // Ownership check.
  const { data: batch } = await admin.from("batches").select("teacher_id").eq("id", batchId).maybeSingle();
  if (!batch) throw new Error("Class not found");
  if (!isAdmin && batch.teacher_id !== profile.id) throw new Error("You can only edit your own class.");

  const { error } = await admin.from("batches").update({ meet_link: link }).eq("id", batchId);
  if (error) throw new Error(error.message);

  if (link) {
    const { data: students } = await admin
      .from("enrollments").select("student_id").eq("batch_id", batchId).eq("status", "approved");
    await notifyMany((students ?? []).map((s) => s.student_id as string), LINK_TITLE, LINK_BODY).catch(() => {});
  }
  revalidateAll();
}

// Set the personal 1:1 class link for a single student's enrolment.
export async function setEnrollmentMeetLink(formData: FormData) {
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");
  const isAdmin = ["admin", "super_admin"].includes(profile.role);
  const admin = svc();
  if (!admin) throw new Error("Server not configured (SUPABASE_SERVICE_ROLE_KEY).");

  const enrollmentId = String(formData.get("enrollment_id") ?? "");
  const link = String(formData.get("meet_link") ?? "").trim() || null;
  if (!enrollmentId) throw new Error("Enrollment required");

  // Ownership: the teacher assigned to the enrolment or its batch.
  const { data: enr } = await admin
    .from("enrollments").select("student_id, teacher_id, batch_id").eq("id", enrollmentId).maybeSingle();
  if (!enr) throw new Error("Enrolment not found");
  let owns = enr.teacher_id === profile.id;
  if (!owns && enr.batch_id) {
    const { data: b } = await admin.from("batches").select("teacher_id").eq("id", enr.batch_id).maybeSingle();
    owns = b?.teacher_id === profile.id;
  }
  if (!isAdmin && !owns) throw new Error("You can only edit your own student's class link.");

  const { error } = await admin.from("enrollments").update({ meet_link: link }).eq("id", enrollmentId);
  if (error) throw new Error(error.message);

  if (link && enr.student_id) await notifyMany([enr.student_id as string], LINK_TITLE, LINK_BODY).catch(() => {});
  revalidateAll();
}

// Add an extra class link to a student's enrolment (unlimited per class).
export async function addClassLink(formData: FormData) {
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");
  const admin = svc();
  if (!admin) throw new Error("Server not configured (SUPABASE_SERVICE_ROLE_KEY).");

  const enrollmentId = String(formData.get("enrollment_id") ?? "") || null;
  const batchId = String(formData.get("batch_id") ?? "") || null;
  const url = String(formData.get("url") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim() || null;
  if (!url) throw new Error("A link URL is required");
  if (!enrollmentId && !batchId) throw new Error("Class is required");

  const { error } = await admin.from("class_links").insert({
    enrollment_id: enrollmentId, batch_id: batchId, teacher_id: profile.id, label, url,
  });
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function deleteClassLink(formData: FormData) {
  const profile = await getProfile();
  if (!profile) throw new Error("Not authenticated");
  const admin = svc();
  if (!admin) throw new Error("Server not configured (SUPABASE_SERVICE_ROLE_KEY).");
  const id = String(formData.get("link_id") ?? "");
  await admin.from("class_links").delete().eq("id", id).eq("teacher_id", profile.id);
  revalidateAll();
}
