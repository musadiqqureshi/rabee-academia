"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, CheckCircle2 } from "lucide-react";
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
  const router = useRouter();
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
        setImage(null);
        router.refresh();
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

      {/* Prominent file upload — attach one image (e.g. your poster) */}
      <div>
        <span className="block text-sm font-semibold text-foreground mb-2">
          Upload your assignment file <span className="text-destructive">*</span>
        </span>
        <label
          className={`group relative flex flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-colors ${
            image || hasImage
              ? "border-primary bg-primary/10"
              : "border-primary/50 bg-primary/5 hover:bg-primary/10 hover:border-primary"
          }`}
        >
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
          <span className="grid place-items-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
            {image || hasImage ? <CheckCircle2 className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
          </span>
          <span className="text-base font-bold text-foreground">
            {image ? "Change file" : hasImage ? "Replace uploaded file" : "Click to upload your file"}
          </span>
          <span className="text-xs text-muted-foreground max-w-[16rem] truncate">
            {image
              ? image.name
              : hasImage
                ? "A file is already attached — click to replace it"
                : "JPG or PNG image · up to 8 MB"}
          </span>
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-1.5 text-xs font-semibold text-primary-foreground">
            <UploadCloud className="w-3.5 h-3.5" /> Choose file
          </span>
        </label>
        {image && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" /> {image.name} ready to submit
          </p>
        )}
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
