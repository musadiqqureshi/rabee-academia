import { FileText, ExternalLink } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherMaterials() {
  const profile = await requireRole("teacher");
  const supabase = await createClient();

  const { data: batches } = await supabase
    .from("batches")
    .select("id")
    .eq("teacher_id", profile.id);

  const batchIds = batches?.map((b) => b.id) ?? [];

  const { data: materials } = await supabase
    .from("materials")
    .select(`
      id, title, description, file_url, created_at,
      batches ( subjects ( name ) )
    `)
    .in("batch_id", batchIds.length > 0 ? batchIds : ["00000000-0000-0000-0000-000000000000"])
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Materials</h1>
          <p className="text-sm text-muted-foreground mt-1">Study materials uploaded for your batches</p>
        </div>
        <button
          disabled
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold opacity-50 cursor-not-allowed"
          title="Upload functionality coming soon"
        >
          Upload Material
        </button>
      </div>

      {(!materials || materials.length === 0) ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No materials uploaded</p>
          <p className="text-sm text-muted-foreground mt-1">
            Upload notes, slides, and assignments for your students.
          </p>
        </div>
      ) : (
        <div className="mt-6 bg-card border border-card-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Uploaded</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">File</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {materials.map((m) => {
                const batch = m.batches as unknown as { subjects: { name: string } | null } | null;
                return (
                  <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{m.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{batch?.subjects?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{m.description ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(m.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {m.file_url ? (
                        <a
                          href={m.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                        >
                          <ExternalLink className="w-3 h-3" /> View
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No file</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
