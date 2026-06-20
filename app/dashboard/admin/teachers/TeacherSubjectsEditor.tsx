"use client";

import { useState, useTransition } from "react";
import { BookOpen, X, Check } from "lucide-react";
import { setTeacherSubjects } from "./actions";

interface Subject { id: string; name: string }

export default function TeacherSubjectsEditor({
  teacherId, subjects, selected,
}: {
  teacherId: string;
  subjects: Subject[];
  selected: string[];
}) {
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<string[]>(selected);
  const [pending, startTransition] = useTransition();

  const names = subjects.filter((s) => chosen.includes(s.id)).map((s) => s.name);

  function toggle(id: string) {
    setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  }
  function save() {
    startTransition(async () => {
      await setTeacherSubjects(teacherId, chosen);
      setOpen(false);
    });
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-left">
        {names.length ? (
          <span className="inline-flex flex-wrap gap-1">
            {names.slice(0, 3).map((n) => (
              <span key={n} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{n}</span>
            ))}
            {names.length > 3 && <span className="text-xs text-muted-foreground">+{names.length - 3}</span>}
          </span>
        ) : (
          <span className="text-xs text-primary hover:underline inline-flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> Assign subjects</span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-card-border bg-card shadow-xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Assign subjects</h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Students who enroll in these subjects are auto-allotted to this teacher on approval.</p>
            <div className="max-h-72 overflow-y-auto space-y-1">
              {subjects.length === 0 && <p className="text-sm text-muted-foreground">No subjects yet. Add subjects first.</p>}
              {subjects.map((s) => (
                <label key={s.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm ${chosen.includes(s.id) ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
                  <input type="checkbox" checked={chosen.includes(s.id)} onChange={() => toggle(s.id)} />
                  {s.name}
                </label>
              ))}
            </div>
            <button onClick={save} disabled={pending}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-60">
              <Check className="w-4 h-4" /> {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
