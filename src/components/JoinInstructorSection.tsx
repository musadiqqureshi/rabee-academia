import Link from "next/link";
import { GraduationCap, ArrowRight, CheckCircle2, ClipboardCheck, Wallet, CalendarClock } from "lucide-react";

const PERKS = [
  { icon: ClipboardCheck, title: "AI-screened assessment", desc: "Prove your subject mastery with a fair, AI-generated test." },
  { icon: Wallet, title: "Competitive earnings", desc: "Teach one-to-one students and grow with the academy." },
  { icon: CalendarClock, title: "Flexible schedule", desc: "Choose regular or weekend classes that suit you." },
];

export default function JoinInstructorSection() {
  return (
    <section className="py-20" id="join-instructor">
      <div className="container mx-auto px-4 md:px-6">
        <div className="relative max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-primary via-accent to-primary p-[1.5px] shadow-2xl">
          <div className="rounded-[calc(1.5rem-1.5px)] bg-card/95 backdrop-blur-sm p-8 md:p-12">
            <div className="grid md:grid-cols-[1.2fr_1fr] gap-10 items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
                  <GraduationCap className="w-3.5 h-3.5" /> We&apos;re hiring teachers
                </span>
                <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">Join Us as an Instructor</h2>
                <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-lg">
                  Love teaching? Apply to join Rabee Academia. Submit your application, take a short AI-screened subject test, and interview with our team — your own instructor portal guides every step.
                </p>
                <ul className="mt-5 space-y-2">
                  {PERKS.map((p) => (
                    <li key={p.title} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span><strong className="text-foreground">{p.title}.</strong> <span className="text-muted-foreground">{p.desc}</span></span>
                    </li>
                  ))}
                </ul>
                <Link href="/instructor"
                  className="mt-7 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-bold hover:opacity-90 shadow-[0_0_24px_rgba(99,102,241,0.35)]">
                  Apply to teach <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid gap-3">
                {[
                  { n: "1", t: "Apply & pay the assessment fee" },
                  { n: "2", t: "Pass the AI-screened subject test (70%)" },
                  { n: "3", t: "Interview with our team & get hired" },
                ].map((s) => (
                  <div key={s.n} className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-4">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent text-white text-sm font-bold grid place-items-center shrink-0">{s.n}</span>
                    <p className="text-sm font-semibold">{s.t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
