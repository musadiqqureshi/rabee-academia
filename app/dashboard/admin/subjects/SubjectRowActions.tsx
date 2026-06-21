"use client";

import { useState, useTransition } from "react";
import { Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { deleteSubject, setSubjectActive } from "./actions";

export default function SubjectRowActions({ id, isActive }: { id: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function toggle() {
    const fd = new FormData();
    fd.set("subject_id", id);
    fd.set("active", String(!isActive));
    startTransition(() => setSubjectActive(fd));
  }

  function remove() {
    const fd = new FormData();
    fd.set("subject_id", id);
    startTransition(async () => {
      await deleteSubject(fd);
      setConfirming(false);
    });
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      {pending && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
      <button
        onClick={toggle}
        disabled={pending}
        title={isActive ? "Hide from landing page" : "Show on landing page"}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border border-border hover:bg-muted disabled:opacity-50"
      >
        {isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        {isActive ? "Hide" : "Show"}
      </button>
      {confirming ? (
        <>
          <button onClick={remove} disabled={pending}
            className="px-2 py-1 rounded-md text-xs bg-destructive text-white hover:opacity-90 disabled:opacity-50">
            Confirm
          </button>
          <button onClick={() => setConfirming(false)} disabled={pending}
            className="px-2 py-1 rounded-md text-xs border border-border hover:bg-muted">
            Cancel
          </button>
        </>
      ) : (
        <button onClick={() => setConfirming(true)} disabled={pending}
          title="Delete subject"
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border border-border text-destructive hover:bg-destructive/10 disabled:opacity-50">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      )}
    </div>
  );
}
