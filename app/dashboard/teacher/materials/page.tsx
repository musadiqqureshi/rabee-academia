import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import MaterialsClient from "./MaterialsClient";

export default async function TeacherMaterials() {
  const profile = await requireRole("teacher");
  const supabase = await createClient();

  const { data: batches } = await supabase
    .from("batches")
    .select("id, subjects ( name )")
    .eq("teacher_id", profile.id);

  const batchList = (batches ?? []).map((b) => ({
    id: b.id,
    subjects: Array.isArray(b.subjects) ? (b.subjects[0] ?? null) : (b.subjects as unknown as { name: string } | null),
  })) as { id: string; subjects: { name: string } | null }[];
  const batchIds = batchList.map((b) => b.id);

  const { data: rawMaterials } = await supabase
    .from("materials")
    .select(`
      id, title, description, file_url, created_at, batch_id,
      batches ( subjects ( name ) )
    `)
    .in("batch_id", batchIds.length > 0 ? batchIds : ["00000000-0000-0000-0000-000000000000"])
    .order("created_at", { ascending: false });

  const materials = (rawMaterials ?? []).map((m) => {
    const batch = m.batches as unknown as { subjects: { name: string } | null } | null;
    return {
      id: m.id,
      title: m.title,
      description: m.description,
      file_url: m.file_url,
      created_at: m.created_at,
      subjectName: batch?.subjects?.name ?? null,
    };
  });

  return (
    <MaterialsClient
      teacherId={profile.id}
      initialMaterials={materials}
      batches={batchList}
    />
  );
}
