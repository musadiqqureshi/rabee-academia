import Link from "next/link";
import { Sparkles, Calendar, ArrowRight, CheckCircle2, Briefcase } from "lucide-react";
import { getCourse } from "@/lib/courses";
import MasterySeats from "@/components/MasterySeats";

export default function AIMasterySection({ seatsTaken = 0 }: { seatsTaken?: number }) {
  const course = getCourse("ai-mastery");
  if (!course || !course.special) return null;
  const limit = course.seatLimit ?? 30;
  const left = Math.max(0, limit - seatsTaken);
  const full = left <= 0;
  const Icon = course.icon;

  return (
    <section className="py-16" id="ai-mastery">
      <div className="container mx-auto px-4 md:px-6">
        <div className="glow-card relative max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-600 p-[1.5px]">
          <div className="rounded-[calc(1.5rem-1.5px)] bg-card/95 backdrop-blur-sm p-8 md:p-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white text-xs font-extrabold">
                <Sparkles className="w-3.5 h-3.5" /> SPECIAL LAUNCH OFFER
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-amber-950 text-xs font-bold">FREE</span>
            </div>

            <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white grid place-items-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold">{course.name}</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4 max-w-lg">{course.description}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary" /> {course.duration} · {course.schedule}</span>
                  <MasterySeats limit={limit} initialLeft={left} />
                </div>
                <ul className="grid sm:grid-cols-2 gap-1.5 mt-4">
                  {course.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-foreground/75">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" /> {f}
                    </li>
                  ))}
                </ul>

                {/* Internship offer */}
                <div className="mt-5 rounded-xl border border-amber-400/40 bg-amber-400/10 p-4">
                  <div className="flex items-start gap-2.5">
                    <Briefcase className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs leading-relaxed text-foreground/80">
                      <strong className="text-foreground">🚀 Internship opportunity:</strong> We&apos;ll select{" "}
                      <strong className="text-foreground">7 students</strong> for a{" "}
                      <strong className="text-foreground">free 1-month internship</strong> at our software agency{" "}
                      <a href="https://tech-solutions.site" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">Tech Solutions Pakistan</a>{" "}
                      — and afterwards choose <strong className="text-foreground">3 of them for future roles</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center shrink-0">
                <p className="text-4xl font-extrabold bg-gradient-to-r from-fuchsia-500 to-purple-500 bg-clip-text text-transparent">FREE</p>
                <p className="text-xs text-muted-foreground mb-4">limited seats</p>
                {full ? (
                  <span className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-muted text-muted-foreground text-sm font-bold">Seats Full</span>
                ) : (
                  <Link href="/enroll?subject=ai-mastery&type=weekend"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-sm font-bold hover:opacity-90 shadow-lg">
                    Reserve your seat <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
