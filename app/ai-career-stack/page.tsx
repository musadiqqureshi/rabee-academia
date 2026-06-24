import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2, Rocket, GraduationCap, Briefcase, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnforceTheme from "@/components/EnforceTheme";
import { CAREER_STACK, STACK_BUNDLE, ROADMAP } from "@/lib/careerStack";

const fmt = (n: number) => "PKR " + n.toLocaleString("en-PK");

export const metadata: Metadata = {
  title: "AI Career Stack — Become Job-Ready in AI | Rabee Academia",
  description:
    "Learn AI for free, then upgrade into real-world, job-ready skills. The Rabee AI Career Stack: 5 affordable micro-courses (PKR 500–1000) in AI automation, data engineering, model building, creative AI and workflow integration. Launching soon.",
  alternates: { canonical: "/ai-career-stack" },
};

export default function CareerStackPage() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <EnforceTheme mode="site" />
      <Navbar />

      <div className="pt-28 pb-20 container mx-auto px-4 md:px-6 max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white text-xs font-extrabold mb-4">
            <Rocket className="w-3.5 h-3.5" /> LAUNCHING SOON
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Rabee AI Career Stack</h1>
          <p className="text-base md:text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
            Learn AI for <strong className="text-foreground">free</strong> → upgrade into <strong className="text-foreground">real-world, job-ready skills</strong> for industry jobs and freelancing.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <Link href="/enroll?subject=ai-mastery&type=weekend"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-bold hover:opacity-90">
              Start free with AI Mastery <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="https://chat.whatsapp.com/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-sm font-semibold hover:bg-muted">
              Join the waitlist
            </a>
          </div>
        </div>

        {/* Roadmap */}
        <div className="rounded-2xl border border-border bg-card p-6 mb-12">
          <p className="text-xs font-semibold text-muted-foreground text-center uppercase tracking-widest mb-5">Your learning ladder</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ROADMAP.map((step, i) => {
              const Icon = [GraduationCap, Sparkles, Briefcase, Rocket][i];
              return (
                <div key={step} className="relative rounded-xl border border-border bg-background/50 p-4 text-center">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent text-white grid place-items-center mx-auto mb-2"><Icon className="w-4 h-4" /></div>
                  <p className="text-xs font-semibold">{step}</p>
                  {i < ROADMAP.length - 1 && <ArrowRight className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Courses */}
        <h2 className="text-2xl font-extrabold text-center mb-2">5 job-ready micro-courses</h2>
        <p className="text-sm text-muted-foreground text-center mb-8">Each course: 5–10 short modules · 1 real project · certificate on completion.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {CAREER_STACK.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.slug} className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
                <div className={`h-24 bg-gradient-to-br ${c.gradient} flex items-center justify-between px-5`}>
                  <Icon className="w-9 h-9 text-white" strokeWidth={1.5} />
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.tier === "Premium" ? "bg-amber-400 text-amber-950" : "bg-white/20 text-white"}`}>{c.tier}</span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold">{c.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">{c.tagline}</p>
                  <ul className="space-y-1.5 mb-4 flex-1">
                    {c.skills.map((s) => (
                      <li key={s} className="flex items-start gap-2 text-xs text-foreground/75"><CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> {s}</li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div>
                      <p className="text-lg font-extrabold">{fmt(c.price)}</p>
                      <p className="text-[10px] text-muted-foreground">{c.modules} modules · 1 project</p>
                    </div>
                    <span className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-bold">Soon</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Bundle */}
          <div className="rounded-2xl border-2 border-fuchsia-500/50 bg-gradient-to-br from-fuchsia-600/10 to-purple-600/10 p-5 flex flex-col">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white text-[10px] font-extrabold w-fit mb-2"><Star className="w-3 h-3 fill-current" /> BEST VALUE</span>
            <h3 className="font-bold">{STACK_BUNDLE.name}</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-3">Get all 5 courses and complete the full AI career path.</p>
            <ul className="space-y-1.5 mb-4 flex-1 text-xs text-foreground/75">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> All 5 courses + projects</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> 5 certificates</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Best price per course</li>
            </ul>
            <div className="border-t border-border pt-3">
              <p className="text-xl font-extrabold">{fmt(STACK_BUNDLE.price)} <span className="text-xs font-normal text-muted-foreground line-through">{fmt(STACK_BUNDLE.original)}</span></p>
              <p className="text-[11px] text-amber-500 font-semibold mt-1">⚡ First 100 students get the launch discount</p>
            </div>
          </div>
        </div>

        {/* Funnel CTA */}
        <div className="rounded-3xl bg-gradient-to-r from-primary to-accent p-[1.5px]">
          <div className="rounded-[calc(1.5rem-1.5px)] bg-card/95 p-8 text-center">
            <h2 className="text-2xl font-extrabold mb-2">Start free, then go job-ready</h2>
            <p className="text-sm text-muted-foreground mb-5 max-w-xl mx-auto">Begin with the free AI Mastery course (prompt engineering + AI automation intro). When the Career Stack launches, you&apos;ll be first in line.</p>
            <Link href="/enroll?subject=ai-mastery&type=weekend"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-sm font-bold hover:opacity-90">
              Reserve your free AI Mastery seat <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
