"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40";

export default function AddTeacherForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold hover:opacity-90">
        <Plus className="w-4 h-4" /> Add Teacher
      </button>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      full_name: String(fd.get("full_name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      password: String(fd.get("password") ?? ""),
    };
    startTransition(async () => {
      const res = await fetch("/api/admin/create-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Failed to create teacher");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
      <div className="w-full max-w-md rounded-2xl border border-card-border bg-card shadow-xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Add Teacher</h3>
          <button onClick={() => setOpen(false)} aria-label="Close" className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block"><span className="block text-xs font-medium text-muted-foreground mb-1.5">Full name *</span><input name="full_name" required className={inputCls} placeholder="Dr. Sarah Khan" /></label>
          <label className="block"><span className="block text-xs font-medium text-muted-foreground mb-1.5">Email *</span><input name="email" type="email" required className={inputCls} placeholder="teacher@example.com" /></label>
          <label className="block"><span className="block text-xs font-medium text-muted-foreground mb-1.5">Phone</span><input name="phone" className={inputCls} placeholder="+92 300 1234567" /></label>
          <label className="block"><span className="block text-xs font-medium text-muted-foreground mb-1.5">Temporary password *</span><input name="password" type="text" required minLength={6} className={inputCls} placeholder="min 6 characters" /></label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={pending} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-60">
              {pending ? "Creating…" : "Create Teacher"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
