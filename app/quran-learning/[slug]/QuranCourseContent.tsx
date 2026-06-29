"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Users, Sparkles, GraduationCap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import RabeeAIWidget from "@/components/RabeeAIWidget";
import { getQuranCourse, LANDING, PRICE_ACTUAL, PRICE_LAUNCH } from "@/lib/quranContent";
import { useLang, LanguageSwitcher } from "../lang";
import QuranEnrollForm from "./QuranEnrollForm";
import EnrollButton from "./EnrollButton";

const fmt = (n: number) => "PKR " + n.toLocaleString("en-PK");

const TR = {
  en: {
    back: "All Quran courses", outline: "Course outline", whoFor: "Who is this for?",
    outcomes: "What you'll achieve", module: "Module", enrollHeading: "Enroll in this course",
    perMonth: "/ month", was: "was", launch: "Launch offer", enrollCta: "Enroll Now",
  },
  ur: {
    back: "تمام قرآن کورسز", outline: "کورس کا خاکہ", whoFor: "یہ کس کے لیے ہے؟",
    outcomes: "آپ کیا حاصل کریں گے", module: "ماڈیول", enrollHeading: "اس کورس میں داخلہ لیں",
    perMonth: "/ ماہانہ", was: "پہلے", launch: "افتتاحی پیشکش", enrollCta: "ابھی داخلہ لیں",
  },
} as const;

function IslamicPattern({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      <svg className="w-full h-full text-emerald-500/[0.07]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="islamic-star-c" width="56" height="56" patternUnits="userSpaceOnUse">
            <path d="M28 4 L34 18 L48 14 L40 28 L48 42 L34 38 L28 52 L22 38 L8 42 L16 28 L8 14 L22 18 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="28" cy="28" r="3" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-star-c)" />
      </svg>
    </div>
  );
}

export default function QuranCourseContent({ slug }: { slug: string }) {
  const { lang } = useLang();
  const t = TR[lang];
  const a = LANDING[lang];
  const course = getQuranCourse(slug);
  if (!course) return null;

  return (
    <div className="min-h-screen text-foreground overflow-x-hidden">
      <AnimatedBackground />
      <div className="fixed top-0 inset-x-0 z-50"><Navbar /></div>

      <section className="relative pt-28 pb-16 overflow-hidden">
        <IslamicPattern />
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px]" />
        </div>
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="flex items-center justify-between gap-3 mb-6">
            <Link href="/quran-learning" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t.back}
            </Link>
            <LanguageSwitcher />
          </div>
          <div className={`rounded-3xl bg-gradient-to-br ${course.gradient} p-[1.5px] shadow-2xl`}>
            <div className="rounded-[calc(1.5rem-1.5px)] bg-card/90 backdrop-blur-sm p-7 md:p-9 relative overflow-hidden">
              <IslamicPattern className="opacity-50" />
              <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white grid place-items-center shrink-0"><BookOpen className="w-8 h-8" strokeWidth={1.5} /></div>
                <div className="flex-1">
                  <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">{course.name[lang]}</h1>
                  <p className="text-sm md:text-base text-muted-foreground mt-2">{course.tagline[lang]}</p>
                </div>
                <div className="text-start md:text-end shrink-0">
                  <p className="text-3xl font-extrabold">{fmt(PRICE_LAUNCH)}<span className="text-sm font-normal text-muted-foreground">{t.perMonth}</span></p>
                  <p className="text-xs text-muted-foreground">{t.was} <span className="line-through">{fmt(PRICE_ACTUAL)}</span> · <span className="text-amber-600 font-semibold">{t.launch}</span></p>
                  <EnrollButton slug={course.slug} label={t.enrollCta}
                    className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold hover:opacity-90 disabled:opacity-70" />
                </div>
              </div>
              <p className="relative text-sm text-foreground/80 leading-relaxed mt-6">{course.intro[lang]}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-10">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl grid md:grid-cols-[1.4fr_1fr] gap-6">
          {/* Outline */}
          <div className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-6">
            <h2 className="text-lg font-extrabold mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-emerald-500" /> {t.outline}</h2>
            <ol className="space-y-3">
              {course.modules[lang].map((m, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 text-xs font-bold grid place-items-center shrink-0">{i + 1}</span>
                  <span className="text-sm pt-0.5">{m}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Side: who for + outcomes */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-6">
              <h2 className="text-base font-extrabold mb-2 flex items-center gap-2"><Users className="w-4 h-4 text-emerald-500" /> {t.whoFor}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{course.whoFor[lang]}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-6">
              <h2 className="text-base font-extrabold mb-3 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-emerald-500" /> {t.outcomes}</h2>
              <ul className="space-y-2">
                {course.outcomes[lang].map((o, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> {o}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Enroll */}
      <section id="enroll" className="py-14 scroll-mt-24">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t.enrollHeading}</h2>
          </div>
          <QuranEnrollForm slug={course.slug} courseName={course.name.en} lang={lang} />
        </div>
      </section>

      <Footer />

      <RabeeAIWidget
        topic="quran"
        accentClass="from-emerald-600 to-teal-600"
        title={a.ai.title}
        subtitle={a.ai.subtitle}
        launcherLabel={a.ai.launcher}
        placeholder={a.ai.placeholder}
        typingLabel={a.ai.typing}
        greeting={a.ai.greeting}
        suggestions={[...a.ai.suggestions]}
      />
    </div>
  );
}
