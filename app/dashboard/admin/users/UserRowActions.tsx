"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2, ShieldOff } from "lucide-react";
import { deleteUser, setUserRole } from "./actions";

export default function UserRowActions({ id, role, isSelf }: { id: string; role: string; isSelf: boolean }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isSelf) return <span className="text-xs text-muted-foreground">You</span>;

  function changeRole(newRole: string) {
    setError(null);
    const fd = new FormData();
    fd.set("user_id", id);
    fd.set("role", newRole);
    startTransition(async () => {
      try { await setUserRole(fd); } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    });
  }

  function remove() {
    setError(null);
    const fd = new FormData();
    fd.set("user_id", id);
    startTransition(async () => {
      try { await deleteUser(fd); setConfirming(false); } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    });
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      {pending && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
      {error && <span className="text-[11px] text-destructive max-w-[160px] truncate" title={error}>{error}</span>}

      <select
        value={role}
        disabled={pending}
        onChange={(e) => changeRole(e.target.value)}
        title="Change role"
        className="rounded-md border border-border bg-background text-xs px-1.5 py-1 disabled:opacity-50"
      >
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
        <option value="admin">Admin</option>
      </select>

      {role === "teacher" && (
        <button onClick={() => changeRole("student")} disabled={pending} title="Revoke teacher (set to student)"
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border border-border hover:bg-muted disabled:opacity-50">
          <ShieldOff className="w-3.5 h-3.5" /> Revoke
        </button>
      )}

      {confirming ? (
        <>
          <button onClick={remove} disabled={pending} className="px-2 py-1 rounded-md text-xs bg-destructive text-white hover:opacity-90 disabled:opacity-50">Confirm</button>
          <button onClick={() => setConfirming(false)} disabled={pending} className="px-2 py-1 rounded-md text-xs border border-border hover:bg-muted">Cancel</button>
        </>
      ) : (
        <button onClick={() => setConfirming(true)} disabled={pending} title="Delete user"
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border border-border text-destructive hover:bg-destructive/10 disabled:opacity-50">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      )}
    </div>
  );
}
