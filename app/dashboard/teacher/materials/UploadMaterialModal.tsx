"use client";

import { useState } from "react";
import { Upload, Link, X, Loader2 } from "lucide-react";
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

type Mode = "drive" | "file";

export default function UploadMaterialModal({ teacherId, batches, onClose, onUploaded }: Props) {
  const [mode, setMode] = useState<Mode>("drive");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [batchId, setBatchId] = useState(batches[0]?.id ?? "");
  const [driveUrl, setDriveUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!batchId) { setError("No batch available."); return; }
    if (mode === "drive" && !driveUrl.trim()) { setError("Please enter a Google Drive link."); return; }
    if (mode === "file" && !file) { setError("Please select a file."); return; }
    setError(null);
    setLoading(true);

    const supabase = createClient();
    let fileUrl: string | null = null;
    let fileType: string | null = null;

    if (mode === "drive") {
      fileUrl = driveUrl.trim();
      fileType = "google_drive";
    } else if (file) {
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
      fileUrl = urlData.publicUrl;
      fileType = file.type;
    }

    const { error: insertError } = await supabase.from("materials").insert({
      batch_id: batchId,
      teacher_id: teacherId,
      title,
      description: description || null,
      file_url: fileUrl,
      file_type: fileType,
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
          <h2 className="text-lg font-bold">Add Material</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-lg border border-border p-1 gap-1 mb-5">
          <button
            type="button"
            onClick={() => setMode("drive")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === "drive" ? "bg-primary text-white" : "hover:bg-muted text-muted-foreground"
            }`}
          >
            <Link className="w-3.5 h-3.5" /> Google Drive
          </button>
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === "file" ? "bg-primary text-white" : "hover:bg-muted text-muted-foreground"
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> Upload File
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="batch">Subject / Batch</Label>
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

          {mode === "drive" ? (
            <div className="space-y-1.5">
              <Label htmlFor="driveUrl">Google Drive Link</Label>
              <Input
                id="driveUrl"
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                type="url"
                required
              />
              <p className="text-xs text-muted-foreground">
                Paste a shareable Google Drive link (set sharing to &quot;Anyone with the link&quot;)
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>File</Label>
              <label className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.zip"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                {file
                  ? <p className="text-sm text-primary font-medium">{file.name}</p>
                  : <p className="text-sm text-muted-foreground">Click to select a file</p>}
              </label>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "Saving…" : "Save Material"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
