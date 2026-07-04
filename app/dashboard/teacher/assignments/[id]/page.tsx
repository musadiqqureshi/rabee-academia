import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText, ImageIcon } from "lucide-react";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SUBMISSION_STATUS_LABEL, type SubmissionStatus } from "@/lib/supabase/types";
import { gradeSubmission } from "../actions";

export const dynamic = "force-dynamic";

const statusStyle: Record<SubmissionStatus | "missing", string> = {
  draft: "bg-amber-100 text-amber-700",
  submitted: "bg-blue-100 text-blue-700",
  graded: "bg-emerald-100 text-emerald-700",
  returned: "bg-orange-100 text-orange-700",
  missing: "bg-muted text-muted-foreground",
};

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRole("teacher");
  const supabase = await createClient();

  const { data: assignment } = await supabase
    .from("assignments")
    .select("*, subjects ( name )")
    .eq("id", id)
    .single();
  if (!assignment) notFound();

  // Approved students in the batch.
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("student_id, enrollment_number, profiles:student_id ( full_name, email, student_code )")
    .eq("batch_id", assignment.batch_id)
    .eq("status", "approved");

  const { data: submissions } = await supabase
    .from("assignment_submissions")
    .select("*")
    .eq("assignment_id", id);

  const subByStudent = new Map((submissions ?? []).map((s) => [s.student_id, s]));

  // Sign uploaded submission images (private bucket) via the service role.
  const imageUrls = new Map<string, string>();
  const svcUrl = process.env.NEXT_PUBLIC_SUPABASE_URL, svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (svcUrl && svcKey) {
    const admin = createAdminClient(svcUrl, svcKey, { auth: { autoRefreshToken: false, persistSession: false } });
    for (const s of submissions ?? []) {
      if (!s.file_url) continue;
      const { data } = await admin.storage.from("assignment-files").createSignedUrl(s.file_url as string, 3600);
      if (data?.signedUrl) imageUrls.set(s.id as string, data.signedUrl);
    }
  }

  const rows = (enrollments ?? []).map((e) => {
    const p = e.profiles as unknown as { full_name: string | null; email: string | null; student_code: string | null } | null;
    return {
      studentId: e.student_id,
      name: p?.full_name ?? p?.email ?? "Student",
      code: p?.student_code ?? e.enrollment_number ?? "—",
      submission: subByStudent.get(e.student_id) ?? null,
    };
  });

  const submittedCount = rows.filter((r) => r.submission && r.submission.status !== "draft").length;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/teacher/assignments" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to assignments
      </Link>

      <div className="rounded-2xl border border-card-border bg-card shadow-sm p-5">
        <h1 className="text-xl font-bold">{assignment.title}</h1>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground mt-2">
          <span>{(assignment.subjects as unknown as { name: string } | null)?.name ?? "—"}</span>
          <span>Total marks: <strong className="text-foreground">{assignment.total_marks}</strong></span>
          <span>Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleString() : "—"}</span>
          <span className="capitalize">Method: {assignment.submission_type.replace("_", " ")}</span>
          <span>{submittedCount}/{rows.length} submitted</span>
        </div>
        {assignment.instructions && (
          <p className="text-sm text-foreground/80 mt-3 whitespace-pre-wrap">{assignment.instructions}</p>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-sm">Submissions</h2>
        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">No approved students in this batch yet.</p>
        )}
        {rows.map((r) => {
          const s = r.submission;
          const status = (s?.status ?? "missing") as SubmissionStatus | "missing";
          return (
            <div key={r.studentId} className="rounded-2xl border border-card-border bg-card shadow-sm p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-semibold text-sm">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.code}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle[status]}`}>
                  {status === "missing" ? "Not submitted" : SUBMISSION_STATUS_LABEL[status as SubmissionStatus]}
                  {s?.marks_obtained != null && status === "graded" ? ` · ${s.marks_obtained}/${assignment.total_marks}` : ""}
                </span>
              </div>

              {s && (s.status !== "draft") && (
                <div className="mt-3 space-y-3">
                  {s.drive_url && (
                    <a href={s.drive_url} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                      <ExternalLink className="w-3.5 h-3.5" /> Open Drive submission
                    </a>
                  )}
                  {imageUrls.has(s.id) && (
                    <a href={imageUrls.get(s.id)} target="_blank" rel="noopener noreferrer" className="block w-fit">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrls.get(s.id)} alt="Submitted image" className="max-h-56 rounded-lg border border-border" />
                      <span className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-1"><ImageIcon className="w-3.5 h-3.5" /> Open full image</span>
                    </a>
                  )}
                  {s.content && (
                    <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm prose prose-sm max-w-none"
                         dangerouslySetInnerHTML={{ __html: s.content }} />
                  )}

                  <form action={gradeSubmission} className="flex flex-wrap items-end gap-3 pt-1">
                    <input type="hidden" name="submission_id" value={s.id} />
                    <input type="hidden" name="assignment_id" value={assignment.id} />
                    <label className="block">
                      <span className="block text-xs text-muted-foreground mb-1">Marks (/{assignment.total_marks})</span>
                      <input
                        type="number" name="marks_obtained" min={0} max={assignment.total_marks}
                        defaultValue={s.marks_obtained ?? ""}
                        className="w-28 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                      />
                    </label>
                    <label className="block flex-1 min-w-[200px]">
                      <span className="block text-xs text-muted-foreground mb-1">Feedback</span>
                      <input
                        name="feedback" defaultValue={s.feedback ?? ""}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                        placeholder="Comments for the student"
                      />
                    </label>
                    <button name="action" value="grade"
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">
                      Save grade
                    </button>
                    <button name="action" value="return"
                      className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted">
                      Return for revision
                    </button>
                  </form>
                </div>
              )}

              {(!s || s.status === "draft") && (
                <p className="mt-2 text-xs text-muted-foreground inline-flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Awaiting submission
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
