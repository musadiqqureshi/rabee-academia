import Link from "next/link";
import { ListChecks, ArrowRight, CheckCircle2, CircleDashed } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import CreateQuizForm from "./CreateQuizForm";
import AIQuizForm from "./AIQuizForm";

export const dynamic = "force-dynamic";

export default async function TeacherQuizzesPage() {
  const profile = await requireRole("teacher");
  const supabase = await createClient();

  const { data: batches } = await supabase
    .from("batches").select("id, class_type, subjects ( name )").eq("teacher_id", profile.id);

  const batchOptions = batches?.map((b) => ({
    id: b.id,
    label: `${(b.subjects as unknown as { name: string } | null)?.name ?? "Subject"} · ${b.class_type}`,
  })) ?? [];

  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("id, title, total_marks, is_published, grading_mode, subjects ( name )")
    .eq("teacher_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quizzes</h1>
        <p className="text-sm text-muted-foreground mt-1">Build quizzes, set marking, and review attempts.</p>
      </div>

      <div className="flex flex-wrap items-start gap-3">
        <CreateQuizForm batches={batchOptions} />
        <AIQuizForm batches={batchOptions} />
      </div>

      {quizzes && quizzes.length > 0 ? (
        <div className="grid gap-3">
          {quizzes.map((q) => (
            <Link key={q.id} href={`/dashboard/teacher/quizzes/${q.id}`}
              className="group flex items-center gap-4 rounded-2xl border border-card-border bg-card shadow-sm p-4 hover:shadow-md hover:border-primary/40 transition-all">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                <ListChecks className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{q.title}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                  <span>{(q.subjects as unknown as { name: string } | null)?.name ?? "—"}</span>
                  <span>{q.total_marks} marks</span>
                  <span className="capitalize">{q.grading_mode === "ai" ? "AI marking" : "Manual marking"}</span>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${
                q.is_published ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                {q.is_published ? <CheckCircle2 className="w-3.5 h-3.5" /> : <CircleDashed className="w-3.5 h-3.5" />}
                {q.is_published ? "Published" : "Draft"}
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No quizzes yet. Create your first one above.
        </div>
      )}
    </div>
  );
}
