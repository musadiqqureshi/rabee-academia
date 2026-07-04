import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Calendar, Award } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import SubmissionForm from "../SubmissionForm";

export const dynamic = "force-dynamic";

export default async function StudentAssignmentDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: assignment } = await supabase
    .from("assignments")
    .select("*, subjects ( name )")
    .eq("id", id)
    .single();
  if (!assignment) notFound();

  const { data: submission } = await supabase
    .from("assignment_submissions")
    .select("*")
    .eq("assignment_id", id)
    .eq("student_id", profile.id)
    .maybeSingle();

  const isGraded = submission?.status === "graded";
  const pastDue = assignment.due_date ? new Date(assignment.due_date) < new Date() : false;
  const locked = isGraded; // students may keep editing until graded

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/dashboard/student/assignments" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to assignments
      </Link>

      <div className="rounded-2xl border border-card-border bg-card shadow-sm p-5">
        <h1 className="text-xl font-bold">{assignment.title}</h1>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground mt-2">
          <span>{(assignment.subjects as unknown as { name: string } | null)?.name ?? "—"}</span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Due {assignment.due_date ? new Date(assignment.due_date).toLocaleString() : "—"}
            {pastDue ? " · past due" : ""}
          </span>
          <span>Total marks: {assignment.total_marks}</span>
        </div>
        {assignment.description && <p className="text-sm text-foreground/80 mt-3">{assignment.description}</p>}
        {assignment.instructions && (
          <div className="mt-3 rounded-lg bg-muted/40 p-3 text-sm whitespace-pre-wrap">{assignment.instructions}</div>
        )}
        {assignment.resource_url && (
          <a href={assignment.resource_url} target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-3">
            <ExternalLink className="w-3.5 h-3.5" /> Assignment resources
          </a>
        )}
      </div>

      {isGraded && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <Award className="w-5 h-5" />
            Grade: {submission!.marks_obtained}/{assignment.total_marks}
          </div>
          {submission!.feedback && (
            <p className="text-sm text-emerald-800/80 mt-2"><strong>Feedback:</strong> {submission!.feedback}</p>
          )}
        </div>
      )}

      {submission?.status === "returned" && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
          <strong>Returned for revision.</strong> {submission.feedback}
        </div>
      )}

      <div>
        <h2 className="font-semibold text-sm mb-3">Your submission</h2>
        <SubmissionForm
          assignmentId={assignment.id}
          submissionType={assignment.submission_type}
          initialContent={submission?.content ?? ""}
          initialDriveUrl={submission?.drive_url ?? ""}
          hasImage={Boolean(submission?.file_url)}
          locked={locked}
        />
      </div>
    </div>
  );
}
