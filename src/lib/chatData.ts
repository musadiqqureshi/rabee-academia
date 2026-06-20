import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

export interface ChatContact { id: string; full_name: string | null; email: string | null; role: string }
export interface ChatGroup { batchId: string; label: string }

// Resolves the chat contacts (via RLS-safe RPC) and class groups for a user.
export async function getChatData(profile: Profile): Promise<{ contacts: ChatContact[]; groups: ChatGroup[] }> {
  const supabase = await createClient();

  const { data: contacts } = await supabase.rpc("my_chat_contacts");

  let groups: ChatGroup[] = [];
  if (profile.role === "teacher") {
    const { data: batches } = await supabase
      .from("batches")
      .select("id, class_type, subjects:subject_id ( name )")
      .eq("teacher_id", profile.id);
    groups = (batches ?? []).map((b) => ({
      batchId: b.id,
      label: `${(b.subjects as unknown as { name: string } | null)?.name ?? "Subject"} · ${b.class_type}`,
    }));
  } else if (profile.role === "student") {
    const { data: enr } = await supabase
      .from("enrollments")
      .select("batch_id, subjects:subject_id ( name ), class_type")
      .eq("student_id", profile.id)
      .eq("status", "approved");
    groups = (enr ?? [])
      .filter((e) => e.batch_id)
      .map((e) => ({
        batchId: e.batch_id as string,
        label: `${(e.subjects as unknown as { name: string } | null)?.name ?? "Subject"} · ${e.class_type}`,
      }));
  }

  return { contacts: (contacts as ChatContact[]) ?? [], groups };
}
