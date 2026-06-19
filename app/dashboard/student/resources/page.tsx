import { FileText, Download } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function StudentResources() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  // Get approved enrollments for this student
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("batch_id, subject_id")
    .eq("student_id", profile.id)
    .eq("status", "approved");

  const batchIds = (enrollments ?? []).map((e) => e.batch_id).filter(Boolean) as string[];
  const subjectIds = (enrollments ?? []).map((e) => e.subject_id).filter(Boolean) as string[];

  // Fetch materials via batch_id (direct) or via subject_id → batch lookup
  let materials: {
    id: string;
    title: string;
    description: string | null;
    file_url: string | null;
    created_at: string;
    subjectName: string | null;
  }[] = [];

  if (batchIds.length > 0) {
    const { data } = await supabase
      .from("materials")
      .select(`
        id, title, description, file_url, created_at,
        batches ( subjects ( name ) )
      `)
      .in("batch_id", batchIds)
      .order("created_at", { ascending: false });

    materials = (data ?? []).map((m) => {
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
  } else if (subjectIds.length > 0) {
    // No batch assigned yet — find batches for these subjects and get materials
    const { data: subjectBatches } = await supabase
      .from("batches")
      .select("id")
      .in("subject_id", subjectIds);

    const sbIds = (subjectBatches ?? []).map((b) => b.id);
    if (sbIds.length > 0) {
      const { data } = await supabase
        .from("materials")
        .select(`
          id, title, description, file_url, created_at,
          batches ( subjects ( name ) )
        `)
        .in("batch_id", sbIds)
        .order("created_at", { ascending: false });

      materials = (data ?? []).map((m) => {
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
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Study Resources</h1>
      <p className="text-sm text-muted-foreground mt-1">Materials shared by your teachers</p>

      {materials.length === 0 ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No materials yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your teacher will upload notes, slides, and assignments here.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {materials.map((m) => (
            <div key={m.id} className="bg-card border border-card-border rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{m.title}</p>
                  <p className="text-xs text-primary/80 mt-0.5">{m.subjectName}</p>
                </div>
              </div>
              {m.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{m.description}</p>
              )}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  {new Date(m.created_at).toLocaleDateString()}
                </span>
                {m.file_url ? (
                  <a
                    href={m.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Download className="w-3 h-3" /> Download
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground italic">No file</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
