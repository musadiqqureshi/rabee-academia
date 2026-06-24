import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import CertificateDocument from "@/components/CertificateDocument";
import PrintButton from "@/components/PrintButton";
import { computeOverall, CERT_THRESHOLD } from "@/lib/performance";
import { Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentCertificateView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, batch_id, created_at, completed, subjects:subject_id ( name, level )")
    .eq("id", id)
    .eq("student_id", profile.id)
    .single();
  if (!enrollment) notFound();

  const subject = enrollment.subjects as unknown as { name: string; level: string } | null;
  const perf = await computeOverall(supabase as never, profile.id, enrollment.batch_id);

  // Admin-marked completion always unlocks the certificate.
  if (!enrollment.completed && perf.overall < CERT_THRESHOLD) {
    return (
      <div className="space-y-5 max-w-lg">
        <Link href="/dashboard/student/certificates" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <Lock className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <p className="font-semibold">Certificate locked</p>
          <p className="text-sm text-amber-800/80 mt-1">
            You need <strong>{CERT_THRESHOLD}%</strong> overall to earn this certificate. You&apos;re currently at <strong>{perf.overall}%</strong>.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <Stat label="Attendance" value={perf.attendance} />
            <Stat label="Assignments" value={perf.assignments} />
            <Stat label="Quizzes" value={perf.quizzes} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/dashboard/student/certificates" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <PrintButton label="Print / Save PDF" />
      </div>
      <CertificateDocument
        studentName={profile.full_name ?? "Student"}
        studentCode={profile.student_code ?? "—"}
        subjectName={subject?.name ?? "Course"}
        level={subject?.level}
        date={new Date().toLocaleDateString()}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-lg bg-white/60 border border-amber-200 p-2">
      <p className="font-bold text-amber-900">{value == null ? "—" : `${value}%`}</p>
      <p className="text-amber-700/70">{label}</p>
    </div>
  );
}
