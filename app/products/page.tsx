import Link from "next/link";
import type { Metadata } from "next";
import { FileText, Sparkles, ArrowRight, ClipboardCheck, BookOpen, StickyNote, CalendarDays, ListChecks, Wand2, GraduationCap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnforceTheme from "@/components/EnforceTheme";
import { ENROL_PERK_TEXT } from "@/components/ai/EnrolPerk";

const TOOLS = [
  { href: "/products/paper-maker", name: "Rabee's AI Paper Maker", desc: "Generate professional exam papers with a complete answer key. Print or save as PDF.", icon: FileText, gradient: "from-fuchsia-600 via-purple-600 to-indigo-600", who: "Teachers" },
  { href: "/products/essay-grader", name: "Rabee's AI Essay Grader", desc: "Grade long answers against a marking scheme with marks, breakdown and feedback.", icon: ClipboardCheck, gradient: "from-emerald-500 to-teal-600", who: "Teachers" },
  { href: "/products/lesson-plan", name: "Rabee's AI Lesson Planner", desc: "Classroom-ready lesson plans with objectives, activities, timing and homework.", icon: BookOpen, gradient: "from-indigo-600 to-blue-600", who: "Teachers" },
  { href: "/products/notes", name: "Rabee's AI Notes & Flashcards", desc: "Turn any chapter into crisp notes, key formulas and revision flashcards.", icon: StickyNote, gradient: "from-fuchsia-600 to-purple-600", who: "Students" },
  { href: "/products/planner", name: "Rabee's AI Study Planner", desc: "A day-by-day, exam-ready revision schedule built around your weak areas.", icon: CalendarDays, gradient: "from-orange-500 to-amber-600", who: "Students" },
  { href: "/products/quiz", name: "Rabee's AI Quiz Maker", desc: "Paste your notes and get an instant self-test with scoring and explanations.", icon: ListChecks, gradient: "from-rose-500 to-red-600", who: "Students" },
  { href: "/products/humanizer", name: "Rabee's AI Humanizer", desc: "Rewrite AI-generated text to read naturally and human. Free up to 2,000 words/day.", icon: Wand2, gradient: "from-violet-600 to-fuchsia-600", who: "Everyone" },
];

export const metadata: Metadata = {
  title: "Rabee's AI Products — AI Paper Maker",
  description: "Rabee's AI tools for students and teachers. Generate professional exam papers with answer keys — free once a day.",
};

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <EnforceTheme mode="site" />
      <Navbar />

      <div className="pt-28 pb-20 container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-foreground/80">Rabee&apos;s AI Products</span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-600 text-[10px] font-bold uppercase tracking-wide border border-amber-400/30">Beta</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">AI tools for teachers &amp; students</h1>
          <p className="text-muted-foreground text-sm md:text-base">Smart, time-saving tools powered by Rabee&apos;s AI. Free to try every day.</p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <GraduationCap className="w-4 h-4" /> {ENROL_PERK_TEXT}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {TOOLS.map((t) => {
            const Icon = t.icon;
            return (
              <Link key={t.href} href={t.href} className="group rounded-2xl border border-border bg-card overflow-hidden flex flex-col hover:border-primary/40 transition-colors">
                <div className={`h-24 bg-gradient-to-br ${t.gradient} flex items-center justify-center relative`}>
                  <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm grid place-items-center border border-white/20"><Icon className="w-6 h-6 text-white" /></div>
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">{t.who}</span>
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-extrabold uppercase tracking-wide">Beta</span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="font-bold mb-1">{t.name}</h2>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed flex-1">{t.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-emerald-600">Free · 1 / day</span>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-primary group-hover:gap-2 transition-all">Open <ArrowRight className="w-4 h-4" /></span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">Each tool is free once per day. <Link href="/products/pro" className="text-primary hover:underline">Go Pro</Link> for unlimited use.</p>
      </div>

      <Footer />
    </div>
  );
}
