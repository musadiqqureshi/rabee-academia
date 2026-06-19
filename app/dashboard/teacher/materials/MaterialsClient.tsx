"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, ExternalLink } from "lucide-react";
import UploadMaterialModal from "./UploadMaterialModal";
import RealtimeRefresher from "@/components/dashboard/RealtimeRefresher";

interface Material {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_type: string | null;
  created_at: string;
  subjectName: string | null;
}

interface Batch {
  id: string;
  subjects: { name: string } | null;
}

interface Props {
  teacherId: string;
  initialMaterials: Material[];
  batches: Batch[];
}

export default function MaterialsClient({ teacherId, initialMaterials, batches }: Props) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  function handleUploaded() {
    router.refresh();
  }

  return (
    <div>
      <RealtimeRefresher tables={["materials"]} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Materials</h1>
          <p className="text-sm text-muted-foreground mt-1">Study materials for your students</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={batches.length === 0}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Material
        </button>
      </div>

      {batches.length === 0 && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          You have no batches assigned yet. Ask an admin to create a batch for you.
        </div>
      )}

      {initialMaterials.length === 0 ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No materials yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add notes, slides, or Google Drive links for your students.
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
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {initialMaterials.map((m) => (
                <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{m.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.subjectName ?? "—"}</td>
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
                        <ExternalLink className="w-3 h-3" />
                        {m.file_type === "google_drive" ? "Drive" : "View"}
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No link</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <UploadMaterialModal
          teacherId={teacherId}
          batches={batches}
          onClose={() => setShowModal(false)}
          onUploaded={handleUploaded}
        />
      )}
    </div>
  );
}
