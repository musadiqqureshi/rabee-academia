import { Sparkles, Calendar, ArrowRight, CheckCircle2, Briefcase, Zap, Film, Wand2, Bot } from "lucide-react";
import { getCourse, formatPrice } from "@/lib/courses";

// Batch 2 curriculum — three practical, project-based modules.
const MODULES = [
  {
    icon: Bot,
    title: "AI Automation",
    points: [
      "No-code automation with tools like n8n, Make & Zapier",
      "Connect ChatGPT/Claude to real workflows",
      "Auto-generate content, replies & reports",
    ],
  },
  {
    icon: Film,
    title: "AI Reels & Short Videos",
    points: [
      "Faceless reels with AI voice & script",
      "Text-to-video and image-to-video tools",
      "Editing, captions & posting workflow",
    ],
  },
  {
    icon: Wand2,
    title: "AI Cartoons & Animation",
    points: [
      "Turn ideas & photos into cartoon characters",
      "AI cartoon story & short animation generation",
      "Consistent characters and styles",
    ],
  },
];

export default function AIMasterySection() {
  const course = getCourse("ai-mastery");
  if (!course || !course.special) return null;
  const Icon = course.icon;
  const enrollHref = "/enroll?subject=ai-mastery&type=weekend";

  return (
    <section className="py-16" id="ai-mastery">
      <div className="container mx-auto px-4 md:px-6">
        <div className="glow-card relative max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-600 p-[1.5px]">
          <div className="rounded-[calc(1.5rem-1.5px)] bg-card/95 backdrop-blur-sm p-8 md:p-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white text-xs font-extrabold">
                <Sparkles className="w-3.5 h-3.5" /> SPECIAL COURSE
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold animate-pulse">
                <Zap className="w-3.5 h-3.5" /> BATCH 2 — NOW OPEN
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-amber-950 text-xs font-bold">Only PKR 499</span>
            </div>

            <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl grid place-items-center text-white bg-gradient-to-br from-fuchsia-500 to-purple-600">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold">{course.name}</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4 max-w-lg">{course.description}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                  <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary" /> {course.duration} · {course.schedule}{course.startDate ? ` · starts ${course.startDate}` : ""}</span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600"><CheckCircle2 className="w-4 h-4" /> Batch 2 seats open</span>
                </div>

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
                <p className="text-xs text-muted-foreground">One-time fee</p>
                <p className="text-4xl font-extrabold bg-gradient-to-r from-fuchsia-500 to-purple-500 bg-clip-text text-transparent">{formatPrice(course.weekendPrice)}</p>
                <p className="text-xs text-muted-foreground mb-4">Batch 2 · limited seats</p>
                <a href={enrollHref} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/30">
                  <Sparkles className="w-4 h-4" /> Enroll in Batch 2
                </a>
              </div>
            </div>

            {/* Course outline — what you'll learn in Batch 2 */}
            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground mb-4">What you&apos;ll learn — Batch 2 outline</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {MODULES.map((m, i) => {
                  const MIcon = m.icon;
                  return (
                    <div key={m.title} className="rounded-2xl border border-border bg-background/60 p-4">
                      <div className="flex items-center gap-2.5 mb-3">
                        <span className="w-9 h-9 rounded-xl grid place-items-center text-white bg-gradient-to-br from-fuchsia-500 to-purple-600 shrink-0">
                          <MIcon className="w-5 h-5" />
                        </span>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground">MODULE {i + 1}</p>
                          <p className="text-sm font-bold leading-tight">{m.title}</p>
                        </div>
                      </div>
                      <ul className="space-y-1.5">
                        {m.points.map((p) => (
                          <li key={p} className="flex items-start gap-1.5 text-xs text-foreground/75">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Funnel into the paid AI Career Stack */}
            <div className="mt-6 pt-5 border-t border-border flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-foreground/80">
                Want <strong className="text-foreground">real skills for freelancing &amp; jobs</strong>? Explore our AI Career Stack.
              </p>
              <a href="/ai-career-stack" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                Explore AI Career Stack <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
