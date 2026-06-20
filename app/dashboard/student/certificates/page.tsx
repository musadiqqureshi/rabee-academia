import Link from "next/link";
import { Award, ArrowRight, Lock } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { computeOverall, CERT_THRESHOLD } from "@/lib/performance";

export const dynamic = "force-dynamic";

export default async function StudentCertificates() {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, batch_id, created_at, subjects:subject_id ( name, level )")
    .eq("student_id", profile.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const rows = await Promise.all(
    (enrollments ?? []).map(async (e) => ({
      e,
      perf: await computeOverall(supabase as never, profile.id, e.batch_id),
    })),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Certificates</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Earn your certificate by reaching <strong>{CERT_THRESHOLD}%</strong> overall (attendance + assignments + quizzes).
        </p>
      </div>

      {rows.length > 0 ? (
        <div className="grid gap-3">
          {rows.map(({ e, perf }) => {
            const subject = e.subjects as unknown as { name: string; level: string } | null;
            const eligible = perf.overall >= CERT_THRESHOLD;
            return (
              <div key={e.id} className="flex items-center gap-4 rounded-2xl border border-card-border bg-card shadow-sm p-4">
                <div className={`w-11 h-11 rounded-xl grid place-items-center shrink-0 ${eligible ? "bg-amber-100 text-amber-600" : "bg-muted text-muted-foreground"}`}>
                  {eligible ? <Award className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{subject?.name ?? "Course"}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="h-2 w-32 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${eligible ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${perf.overall}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{perf.overall}% overall</span>
                  </div>
                </div>
                {eligible ? (
                  <Link href={`/dashboard/student/certificates/${e.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 shrink-0">
                    View <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <span className="text-xs text-muted-foreground shrink-0">Reach {CERT_THRESHOLD}% to unlock</span>
                )}
              </div>
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
