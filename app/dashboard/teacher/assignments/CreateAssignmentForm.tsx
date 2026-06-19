"use client";

import { useState, useTransition } from "react";
import { Plus, X, FileText, Link2 } from "lucide-react";
import { createAssignment } from "./actions";

interface BatchOption {
  id: string;
  label: string;
}

export default function CreateAssignmentForm({ batches }: { batches: BatchOption[] }) {
  const [open, setOpen] = useState(false);
  const [submissionType, setSubmissionType] = useState<"portal" | "google_drive">("portal");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (batches.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        You need an assigned batch before you can create assignments.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold shadow-md hover:opacity-90 transition-opacity"
      >
        <Plus className="w-4 h-4" /> New Assignment
      </button>
    );
  }

  function action(formData: FormData) {
    setError(null);
    formData.set("submission_type", submissionType);
    startTransition(async () => {
      try {
        await createAssignment(formData);
        setOpen(false);
        setSubmissionType("portal");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to create assignment");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-card-border bg-card shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Create Assignment</h3>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form action={action} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Title" required>
            <input name="title" required className={inputCls} placeholder="e.g. Newton's Laws problem set" />
          </Field>
          <Field label="Batch" required>
            <select name="batch_id" required className={inputCls} defaultValue={batches[0].id}>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Description">
          <textarea name="description" rows={2} className={inputCls} placeholder="Short summary" />
        </Field>

        <Field label="Instructions">
          <textarea name="instructions" rows={3} className={inputCls} placeholder="Detailed instructions for students" />
        </Field>

        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Due date">
            <input type="datetime-local" name="due_date" className={inputCls} />
          </Field>
          <Field label="Total marks">
            <input type="number" name="total_marks" min={1} defaultValue={100} className={inputCls} />
          </Field>
          <Field label="Resource link (optional)">
            <input name="resource_url" type="url" className={inputCls} placeholder="https://…" />
          </Field>
        </div>

        <div>
          <span className="block text-xs font-medium text-muted-foreground mb-1.5">Submission method</span>
          <div className="grid grid-cols-2 gap-2">
            <TypeCard
              active={submissionType === "portal"}
              onClick={() => setSubmissionType("portal")}
              icon={<FileText className="w-4 h-4" />}
              title="Portal"
              desc="Solve inside the platform"
            />
            <TypeCard
              active={submissionType === "google_drive"}
              onClick={() => setSubmissionType("google_drive")}
              icon={<Link2 className="w-4 h-4" />}
              title="Google Drive"
              desc="Submit a shared link"
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Creating…" : "Create Assignment"}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted-foreground mb-1.5">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}

function TypeCard({
  active, onClick, icon, title, desc,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-colors ${
        active ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border hover:border-primary/40"
      }`}
    >
      <span className={`mt-0.5 ${active ? "text-primary" : "text-muted-foreground"}`}>{icon}</span>
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted-foreground">{desc}</span>
      </span>
    </button>
  );
}
