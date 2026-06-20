import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import CertificateDocument from "@/components/CertificateDocument";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

export default async function StudentCertificateView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, created_at, subjects:subject_id ( name, level )")
    .eq("id", id)
    .eq("student_id", profile.id)
    .single();
  if (!enrollment) notFound();

  const subject = enrollment.subjects as unknown as { name: string; level: string } | null;

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
