import Link from "next/link";
import { Award, ArrowRight } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StudentCertificates() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, created_at, subjects:subject_id ( name, level )")
    .eq("student_id", profile.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Certificates</h1>
        <p className="text-sm text-muted-foreground mt-1">Download certificates for your courses.</p>
      </div>

      {enrollments && enrollments.length > 0 ? (
        <div className="grid gap-3">
          {enrollments.map((e) => {
            const subject = e.subjects as unknown as { name: string; level: string } | null;
            return (
              <Link key={e.id} href={`/dashboard/student/certificates/${e.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-card-border bg-card shadow-sm p-4 hover:shadow-md hover:border-primary/40 transition-all">
                <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 grid place-items-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{subject?.name ?? "Course"}</p>
                  <p className="text-xs text-muted-foreground">Certificate of Completion</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Certificates appear here once you have an approved course.
        </div>
      )}
    </div>
  );
}
