"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  teacherId: string;
  batches: { id: string; subjects: { name: string } | null }[];
  onClose: () => void;
  onUploaded: () => void;
}

export default function UploadMaterialModal({ teacherId, batches, onClose, onUploaded }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [batchId, setBatchId] = useState(batches[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Please select a file."); return; }
    if (!batchId) { setError("No batch available."); return; }
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${teacherId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("materials")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError("File upload failed: " + uploadError.message);
      setLoading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("materials").getPublicUrl(path);

    const { error: insertError } = await supabase.from("materials").insert({
      batch_id: batchId,
      teacher_id: teacherId,
      title,
      description: description || null,
      file_url: urlData.publicUrl,
      file_type: file.type,
    });

    if (insertError) {
      setError("Failed to save material: " + insertError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    onUploaded();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Upload Material</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="batch">Batch</Label>
            <select
              id="batch"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.subjects?.name ?? b.id}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Chapter 3 Notes"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the material"
            />
          </div>

          <div className="space-y-1.5">
            <Label>File</Label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer"
            >
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.zip"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
              {file
                ? <p className="text-sm text-primary font-medium">{file.name}</p>
                : <p className="text-sm text-muted-foreground">Click to select a file</p>}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "Uploading…" : "Upload"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
