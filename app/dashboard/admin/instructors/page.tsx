import { UserPlus, BadgeCheck, FileText } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { STATUS_LABEL, type ApplicationStatus } from "@/lib/instructor";
import { verifyPayment, rejectPayment, setInterview, hire, rejectApplication } from "./actions";

export const dynamic = "force-dynamic";

interface AppRow {
  id: string; user_id: string; full_name: string; email: string; phone: string | null;
  subject_name: string; qualifications: string | null; code: string; payment_status: string;
  status: ApplicationStatus; score: number | null; interview_at: string | null; receipt_url: string | null;
  created_at: string;
}
interface TestRow {
  application_id: string; mcq_score: number | null; long_score: number | null; total_score: number | null;
  ai_feedback: string | null; long_answers: string[] | null; status: string;
}

export default async function AdminInstructors() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data: apps } = await supabase.from("instructor_applications").select("*").order("created_at", { ascending: false });
  const { data: tests } = await supabase.from("instructor_tests").select("application_id, mcq_score, long_score, total_score, ai_feedback, long_answers, status");
  const testByApp = new Map((tests ?? []).map((t) => [t.application_id, t as TestRow]));
  const rows = (apps ?? []) as AppRow[];

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><UserPlus className="w-6 h-6 text-primary" /> Instructor Applications</h1>
        <p className="text-sm text-muted-foreground mt-1">Verify fees to unlock the screening test, review results, schedule interviews and hire.</p>
      </div>

      {rows.length === 0 ? (
        <div className="mt-8 bg-card border border-card-border rounded-xl p-10 text-center">
          <UserPlus className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-lg">No applications yet</p>
          <p className="text-sm text-muted-foreground mt-1">Applications appear here once candidates apply via the instructor portal.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {rows.map((a) => {
            const t = testByApp.get(a.id);
            return (
              <div key={a.id} className="rounded-2xl border border-card-border bg-card shadow-sm p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold">{a.full_name} <span className="font-mono text-xs text-primary ml-1">{a.code}</span></p>
                    <p className="text-xs text-muted-foreground">{a.email}{a.phone ? ` · ${a.phone}` : ""} · wants to teach <strong className="text-foreground">{a.subject_name}</strong></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-muted">{STATUS_LABEL[a.status]}</span>
                    <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${a.payment_status === "verified" ? "bg-emerald-100 text-emerald-700" : a.payment_status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>fee: {a.payment_status}</span>
                  </div>
                </div>

                {a.qualifications && <p className="text-xs text-muted-foreground mb-3 border-l-2 border-border pl-3">{a.qualifications}</p>}

                {/* Test results */}
                {t && t.status === "graded" && (
                  <div className="rounded-xl bg-muted/40 p-3 mb-3 text-xs">
                    <p className="font-bold flex items-center gap-1.5 mb-1"><FileText className="w-3.5 h-3.5" /> Test result: {t.total_score}% (MCQ {t.mcq_score}% · Long {t.long_score}%)</p>
                    {t.ai_feedback && <p className="text-muted-foreground"><strong>AI feedback:</strong> {t.ai_feedback}</p>}
                    {Array.isArray(t.long_answers) && t.long_answers.map((ans, i) => (
                      <details key={i} className="mt-1"><summary className="cursor-pointer text-primary">Long answer {i + 1}</summary><p className="mt-1 whitespace-pre-wrap text-muted-foreground">{ans}</p></details>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-end gap-3">
                  {a.payment_status === "pending" && a.status === "payment_submitted" && (
                    <>
                      <form action={verifyPayment}><input type="hidden" name="id" value={a.id} />
                        <button className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 inline-flex items-center gap-1.5"><BadgeCheck className="w-3.5 h-3.5" /> Verify fee → unlock test</button>
                      </form>
                      <form action={rejectPayment} className="flex items-end gap-1.5"><input type="hidden" name="id" value={a.id} />
                        <input name="note" placeholder="Reason (optional)" className="rounded-lg border border-input bg-background px-2 py-1.5 text-xs w-40" />
                        <button className="px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted">Reject fee</button>
                      </form>
                    </>
                  )}

                  {a.status === "qualified" && (
                    <form action={setInterview} className="flex items-end gap-1.5"><input type="hidden" name="id" value={a.id} />
                      <div><label className="block text-[10px] text-muted-foreground mb-1">Interview date</label>
                        <input type="datetime-local" name="interview_at" className="rounded-lg border border-input bg-background px-2 py-1.5 text-xs" /></div>
                      <button className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90">Schedule interview</button>
                    </form>
                  )}

                  {(a.status === "interview_scheduled" || a.status === "qualified") && (
                    <form action={hire}><input type="hidden" name="id" value={a.id} />
                      <button className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:opacity-90">Hire (make teacher)</button>
                    </form>
                  )}

                  {a.status !== "rejected" && a.status !== "hired" && (
                    <form action={rejectApplication}><input type="hidden" name="id" value={a.id} />
                      <button className="px-3 py-2 rounded-lg border border-border text-xs font-semibold text-destructive hover:bg-destructive/5">Reject application</button>
                    </form>
                  )}
                </div>

                {a.interview_at && <p className="text-xs text-muted-foreground mt-2">Interview: {new Date(a.interview_at).toLocaleString()}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
