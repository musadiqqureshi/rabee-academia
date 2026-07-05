"use client";

import { useState, useTransition } from "react";
import { ImagePlus } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { saveDraft, submitWork } from "./actions";
import type { SubmissionType } from "@/lib/supabase/types";

interface Props {
  assignmentId: string;
  submissionType: SubmissionType;
  initialContent: string;
  initialDriveUrl: string;
  hasImage?: boolean; // an image was already uploaded
  locked: boolean; // true once graded or past due
}

export default function SubmissionForm({
  assignmentId,
  submissionType,
  initialContent,
  initialDriveUrl,
  hasImage = false,
  locked,
}: Props) {
  const [content, setContent] = useState(initialContent);
  const [driveUrl, setDriveUrl] = useState(initialDriveUrl);
  const [image, setImage] = useState<File | null>(null);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(kind: "draft" | "submit") {
    setMsg(null);
    setError(null);
    const fd = new FormData();
    fd.set("assignment_id", assignmentId);
    fd.set("content", content);
    fd.set("drive_url", driveUrl);
    if (image) fd.set("file", image);
    startTransition(async () => {
      try {
        const res = kind === "draft" ? await saveDraft(fd) : await submitWork(fd);
        if (!res.ok) { setError(res.error ?? "Something went wrong."); return; }
        setMsg(kind === "draft" ? "Draft saved." : "Submitted! Your teacher will review it.");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  if (locked) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        This assignment is closed for editing.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {submissionType === "portal" ? (
        <RichTextEditor value={content} onChange={setContent} disabled={pending} />
      ) : (
        <label className="block">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5">
            Google Drive link (document or shared folder)
          </span>
          <input
            type="url"
            value={driveUrl}
            onChange={(e) => setDriveUrl(e.target.value)}
            placeholder="https://drive.google.com/…"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          />
        </label>
      )}

      {/* Image upload — attach one image (e.g. your poster) */}
      <div>
        <span className="block text-xs font-medium text-muted-foreground mb-1.5">Attach an image (one file — e.g. your poster)</span>
        <label className="flex items-center gap-2.5 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm cursor-pointer hover:border-primary/50 transition-colors">
          <ImagePlus className="w-4 h-4 text-muted-foreground shrink-0" />
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
          <span className="text-muted-foreground truncate">
            {image ? image.name : hasImage ? "Image attached — choose another to replace" : "Choose an image (JPG, PNG)"}
          </span>
        </label>
      </div>

      {msg && <p className="text-sm text-emerald-600">{msg}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={() => run("draft")}
          disabled={pending}
          className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted disabled:opacity-60"
        >
          Save draft
        </button>
        <button
          onClick={() => run("submit")}
          disabled={pending}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Submit"}
        </button>
      </div>
    </div>
  );
}
