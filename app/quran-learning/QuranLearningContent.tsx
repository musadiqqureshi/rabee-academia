"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen, ArrowRight, CheckCircle2, Users, ShieldCheck, Clock, FileText,
  BarChart3, Bot, UserCheck, Globe2, Sparkles, GraduationCap, Star, Video, Award,
  MessageSquare, CalendarClock, Layers, Languages, Heart, Phone, CalendarCheck,
  ClipboardList, Mic2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import RabeeAIWidget from "@/components/RabeeAIWidget";
import { LANDING, QURAN_COURSES, QURAN_TEACHERS, PRICE_ACTUAL, PRICE_LAUNCH } from "@/lib/quranContent";
import { useLang, LanguageSwitcher } from "./lang";
import QuranRegisterForm from "./QuranRegisterForm";

const WHY_ICONS = [UserCheck, ShieldCheck, Clock, FileText, BarChart3, Bot, Layers, Globe2];
const AI_ICONS = [CalendarCheck, ClipboardList, FileText, Layers, BarChart3, Mic2, Bot];
const JOURNEY_ICONS = [UserCheck, ClipboardList, Users, CalendarClock, Video, FileText, BarChart3, Award];
const DASH_ICONS = [CalendarCheck, Video, FileText, ClipboardList, Bot, CalendarClock, BarChart3, MessageSquare, Award];

const fmt = (n: number) => "PKR " + n.toLocaleString("en-PK");
const sectionHeading = "text-2xl md:text-4xl font-extrabold tracking-tight";

// Illustrated Islamic-themed hero banners (mosque, Quran, lanterns — SVG art in
// public/quran). Each cross-fades with the hero slide index. A soft veil keeps
// the hero text readable while still letting the artwork show.
const HERO_BANNERS = ["/quran/banner-1.svg", "/quran/banner-2.svg", "/quran/banner-3.svg"];

function HeroBanners({ idx }: { idx: number }) {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden>
      {HERO_BANNERS.map((src, i) => (
        <div key={src} className="absolute inset-0 transition-opacity duration-700 ease-in-out" style={{ opacity: i === idx % HERO_BANNERS.length ? 1 : 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="w-full h-full object-cover object-bottom" />
        </div>
      ))}
      {/* Dimming so the artwork stays soft and the hero text stays readable (both themes) */}
      <div className="absolute inset-0 bg-background/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/35 to-background/80" />
    </div>
  );
}

// Subtle 8-point Islamic geometric pattern, tinted with currentColor.
function IslamicPattern({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      <svg className="w-full h-full text-emerald-500/[0.07]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="islamic-star" width="56" height="56" patternUnits="userSpaceOnUse">
            <path d="M28 4 L34 18 L48 14 L40 28 L48 42 L34 38 L28 52 L22 38 L8 42 L16 28 L8 14 L22 18 Z"
              fill="none" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="28" cy="28" r="3" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-star)" />
      </svg>
    </div>
  );
}

function Hero() {
  const { lang } = useLang();
  const t = LANDING[lang];
  const slides = t.heroSlides;
  const [idx, setIdx] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => { if (!paused.current) setIdx((i) => (i + 1) % slides.length); }, 5500);
    return () => clearInterval(id);
  }, [slides.length]);

  useEffect(() => { setIdx(0); }, [lang]);

  return (
    <section className="relative pt-28 pb-14 overflow-hidden"
      onMouseEnter={() => (paused.current = true)} onMouseLeave={() => (paused.current = false)}>
      <HeroBanners idx={idx} />
      <IslamicPattern />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="flex justify-center mb-7"><LanguageSwitcher /></div>
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 text-xs font-bold mb-5 ring-1 ring-emerald-500/25">
              <Sparkles className="w-3.5 h-3.5" /> {t.badgeNew}
            </span>
            {/* Rotating banner slides */}
            <div className="relative min-h-[210px] md:min-h-[230px]">
              {slides.map((s, i) => (
                <div key={i}
                  className={`transition-all duration-700 ${i === idx ? "opacity-100 translate-y-0 relative" : "opacity-0 translate-y-3 absolute inset-0 pointer-events-none"}`}>
                  <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.15]">
                    {s.title.split(" & ").map((part, k, arr) => (
                      <span key={k}>
                        {k === arr.length - 1 && arr.length > 1
                          ? <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 bg-clip-text text-transparent">{part}</span>
                          : part}
                        {k < arr.length - 1 ? " & " : ""}
                      </span>
                    ))}
                  </h1>
                  <p className="text-base md:text-lg text-muted-foreground mt-4 max-w-xl">{s.subtitle}</p>
                </div>
              ))}
            </div>
            {/* Dots */}
            <div className="flex gap-2 mt-5">
              {slides.map((_, i) => (
                <button key={i} aria-label={`Slide ${i + 1}`} onClick={() => setIdx(i)}
                  className={`h-2 rounded-full transition-all ${i === idx ? "w-7 bg-emerald-500" : "w-2 bg-muted-foreground/30"}`} />
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <a href="#courses" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold hover:opacity-90 shadow-[0_0_24px_rgba(16,185,129,0.3)]">
                {t.ctaEnroll} <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card/60 backdrop-blur-sm text-sm font-bold hover:bg-muted">
                {t.ctaAssess}
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-5 mt-7 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> {t.trust[0]}</span>
              <span className="inline-flex items-center gap-1.5"><Users className="w-4 h-4 text-emerald-500" /> {t.trust[1]}</span>
              <span className="inline-flex items-center gap-1.5"><Globe2 className="w-4 h-4 text-emerald-500" /> {t.trust[2]}</span>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 p-[1.5px] shadow-2xl">
              <div className="rounded-[calc(1.5rem-1.5px)] bg-card/90 backdrop-blur-sm p-6 overflow-hidden">
                <IslamicPattern className="opacity-60" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-500 grid place-items-center"><Video className="w-4 h-4" /></div>
                      <div><p className="text-xs font-bold">Live Quran Session</p><p className="text-[10px] text-muted-foreground">One-to-one · Tajweed</p></div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-500"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 aspect-video grid place-items-center">
                      <div className="text-center"><GraduationCap className="w-7 h-7 text-emerald-500 mx-auto" /><p className="text-[10px] mt-1 font-semibold">Teacher</p></div>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 aspect-video grid place-items-center">
                      <div className="text-center"><BookOpen className="w-7 h-7 text-primary mx-auto" /><p className="text-[10px] mt-1 font-semibold">Student</p></div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-background/60 p-3 flex items-center gap-3">
                    <Bot className="w-5 h-5 text-teal-500 shrink-0" />
                    <div className="flex-1"><div className="h-1.5 w-3/4 rounded-full bg-emerald-500/40 mb-1.5" /><div className="h-1.5 w-1/2 rounded-full bg-muted" /></div>
                    <span className="text-[9px] font-bold text-teal-500">AI Revision</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 rounded-2xl bg-card border border-border shadow-lg px-4 py-3 hidden sm:flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-amber-400/20 text-amber-500 grid place-items-center"><Star className="w-4 h-4 fill-current" /></div>
              <div><p className="text-sm font-extrabold leading-none">4.9/5</p><p className="text-[10px] text-muted-foreground">parent rating</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Moving marquee strip */}
      <div className="mt-12 relative overflow-hidden border-y border-border/60 py-3 bg-card/40">
        <div className="flex gap-3 w-max animate-scroll">
          {[...t.marquee, ...t.marquee].map((m, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold whitespace-nowrap">
              <Sparkles className="w-3 h-3" /> {m}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function QuranLearningContent() {
  const { lang } = useLang();
  const t = LANDING[lang];

  return (
    <div className="min-h-screen text-foreground overflow-x-hidden">
      <AnimatedBackground />
      <div className="fixed top-0 inset-x-0 z-50"><Navbar /></div>

      <Hero />

      {/* Why */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className={sectionHeading}>{t.whyHeading}</h2>
            <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-2xl mx-auto">{t.whySub}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {t.why.map((f, i) => {
              const Icon = WHY_ICONS[i];
              return (
                <div key={i} className="group rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/10">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white grid place-items-center mb-4 transition-transform group-hover:scale-110"><Icon className="w-5 h-5" /></div>
                  <h3 className="font-bold text-sm">{f.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="py-20 scroll-mt-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className={sectionHeading}>{t.coursesHeading}</h2>
            <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-2xl mx-auto">{t.coursesSub}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {QURAN_COURSES.map((c) => (
              <div key={c.slug} className="group rounded-2xl border border-border bg-card/70 backdrop-blur-sm overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/10">
                <div className={`h-24 bg-gradient-to-br ${c.gradient} relative flex items-center px-5 overflow-hidden`}>
                  <IslamicPattern className="opacity-40 text-white" />
                  <BookOpen className="w-10 h-10 text-white relative" strokeWidth={1.5} />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold">{c.name[lang]}</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 mb-4 flex-1 leading-relaxed">{c.tagline[lang]}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{fmt(PRICE_LAUNCH)} <span className="text-[11px] font-normal text-muted-foreground line-through">{fmt(PRICE_ACTUAL)}</span></span>
                    <Link href={`/quran-learning/${c.slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:gap-2.5 transition-all">
                      {t.learnMore} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI assist */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 text-teal-600 text-xs font-bold mb-4 ring-1 ring-teal-500/25"><Bot className="w-3.5 h-3.5" /> {t.aiBadge}</span>
            <h2 className={sectionHeading}>{t.aiHeading}</h2>
            <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-2xl mx-auto">{t.aiSub}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {t.aiFeatures.map((f, i) => {
              const Icon = AI_ICONS[i];
              return (
                <div key={i} className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/40">
                  <div className="w-11 h-11 rounded-xl bg-teal-500/15 text-teal-600 grid place-items-center mx-auto mb-3"><Icon className="w-5 h-5" /></div>
                  <p className="text-sm font-semibold">{f}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-8 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-foreground/80 leading-relaxed"><strong className="text-foreground">{t.aiNoteLead}</strong> {t.aiNote}</p>
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className={sectionHeading}>{t.journeyHeading}</h2>
            <p className="text-sm md:text-base text-muted-foreground mt-3">{t.journeySub}</p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/40 via-teal-500/40 to-emerald-500/40" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 lg:gap-3 relative">
              {t.journey.map((s, i) => {
                const Icon = JOURNEY_ICONS[i];
                return (
                  <div key={i} className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-card border-2 border-emerald-500 text-emerald-500 grid place-items-center mb-3 shadow-lg relative z-10">
                      <Icon className="w-6 h-6" />
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold grid place-items-center">{i + 1}</span>
                    </div>
                    <p className="text-xs font-semibold leading-tight">{s}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className={sectionHeading}>{t.dashHeading}</h2>
            <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-2xl mx-auto">{t.dashSub}</p>
          </div>
          <div className="max-w-4xl mx-auto rounded-3xl border border-border bg-card/80 backdrop-blur-sm p-5 md:p-7 shadow-2xl">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white grid place-items-center"><BookOpen className="w-4 h-4" /></div>
                <div><p className="text-sm font-bold">{t.dashGreeting}</p><p className="text-[11px] text-muted-foreground">{t.dashTrack}</p></div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600"><CalendarCheck className="w-3.5 h-3.5" /> {t.dashNext}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {t.dash.map((d, i) => {
                const Icon = DASH_ICONS[i];
                return (
                  <div key={i} className="rounded-xl border border-border bg-background/60 p-4 flex items-center gap-3 hover:border-emerald-500/40 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-600 grid place-items-center shrink-0"><Icon className="w-4 h-4" /></div>
                    <p className="text-xs font-semibold leading-tight">{d}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Teachers */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className={sectionHeading}>{t.teachersHeading}</h2>
            <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-2xl mx-auto">{t.teachersSub}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {QURAN_TEACHERS.map((tc) => (
              <div key={tc.name} className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 grid place-items-center mx-auto mb-4"><GraduationCap className="w-9 h-9 text-emerald-500" /></div>
                <h3 className="font-bold">{tc.name}</h3>
                <p className="text-xs text-emerald-600 font-semibold mt-1">{tc.qual[lang]}</p>
                <div className="mt-4 space-y-1.5 text-xs text-muted-foreground text-start">
                  <p className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-emerald-500" /> {t.labelExp}: <span className="text-foreground font-medium">{tc.exp[lang]}</span></p>
                  <p className="flex items-center gap-2"><Languages className="w-3.5 h-3.5 text-emerald-500" /> {t.labelLangs}: <span className="text-foreground font-medium">{tc.langs[lang]}</span></p>
                  <p className="flex items-center gap-2"><Star className="w-3.5 h-3.5 text-emerald-500" /> {t.labelSpec}: <span className="text-foreground font-medium">{tc.spec[lang]}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-md">
          <div className="text-center mb-10"><h2 className={sectionHeading}>{t.pricingHeading}</h2></div>
          <div className="relative rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 p-[1.5px] shadow-2xl">
            <div className="rounded-[calc(1.5rem-1.5px)] bg-card/95 backdrop-blur-sm p-8 relative overflow-hidden">
              <IslamicPattern className="opacity-50" />
              <div className="relative text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 text-xs font-bold mb-4 ring-1 ring-emerald-500/25">{t.includesTitle}</span>
                <h3 className="text-lg font-bold">{t.pricingPlan}</h3>
                <p className="mt-3">
                  <span className="text-4xl font-extrabold">{fmt(PRICE_LAUNCH)}</span>
                  <span className="text-sm text-muted-foreground"> {t.perMonth}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-600 font-bold">{t.launchLabel}</span>
                  <span className="ms-2">{t.wasLabel} <span className="line-through">{fmt(PRICE_ACTUAL)}</span></span>
                </p>
                <ul className="mt-6 space-y-2.5 text-start">
                  {t.includes.map((inc) => (
                    <li key={inc} className="flex items-center gap-2.5 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> {inc}</li>
                  ))}
                </ul>
                <a href="#courses" className="mt-7 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold hover:opacity-90 shadow-[0_0_24px_rgba(16,185,129,0.3)]">
                  {t.ctaEnroll} <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12"><h2 className={sectionHeading}>{t.testimonialsHeading}</h2></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {t.testimonials.map((tst, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-6">
                <div className="flex gap-0.5 mb-3">{Array.from({ length: 5 }).map((_, k) => <Star key={k} className="w-4 h-4 text-amber-400 fill-current" />)}</div>
                <p className="text-sm text-foreground/80 leading-relaxed">“{tst.text}”</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-600 grid place-items-center text-sm font-bold">{tst.name[0]}</div>
                  <div><p className="text-sm font-bold leading-none">{tst.name}</p><p className="text-[11px] text-muted-foreground mt-1">{tst.role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="text-center mb-12"><h2 className={sectionHeading}>{t.faqHeading}</h2></div>
          <div className="space-y-3">
            {t.faq.map((f, i) => (
              <details key={i} className="group rounded-xl border border-border bg-card/70 backdrop-blur-sm px-5 py-4">
                <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-sm">
                  {f.q}
                  <ArrowRight className="w-4 h-4 text-emerald-500 transition-transform group-open:rotate-90 shrink-0 rtl:rotate-180 rtl:group-open:rotate-90" />
                </summary>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Register */}
      <section id="register" className="py-20 scroll-mt-24">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="text-center mb-10">
            <h2 className={sectionHeading}>{t.registerHeading}</h2>
            <p className="text-sm md:text-base text-muted-foreground mt-3">{t.registerSub}</p>
          </div>
          <QuranRegisterForm lang={lang} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 p-[1.5px] shadow-2xl max-w-5xl mx-auto">
            <div className="rounded-[calc(1.5rem-1.5px)] bg-card/95 backdrop-blur-sm p-10 md:p-14 text-center relative overflow-hidden">
              <IslamicPattern className="opacity-50" />
              <div className="relative">
                <Heart className="w-8 h-8 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">{t.finalHeading}</h2>
                <p className="text-sm md:text-base text-muted-foreground mt-4 max-w-2xl mx-auto">{t.finalSub}</p>
                <div className="flex flex-wrap justify-center gap-3 mt-8">
                  <a href="#courses" className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold hover:opacity-90 shadow-[0_0_24px_rgba(16,185,129,0.3)]">{t.ctaEnroll} <ArrowRight className="w-4 h-4" /></a>
                  <a href="tel:+923086994758" className="inline-flex items-center gap-2 px-7 py-3 rounded-xl border border-border bg-card/60 backdrop-blur-sm text-sm font-bold hover:bg-muted"><Phone className="w-4 h-4" /> {t.contactUs}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Section-tuned Rabee's AI assistant (Quran context, bilingual) */}
      <RabeeAIWidget
        topic="quran"
        accentClass="from-emerald-600 to-teal-600"
        title={t.ai.title}
        subtitle={t.ai.subtitle}
        launcherLabel={t.ai.launcher}
        placeholder={t.ai.placeholder}
        typingLabel={t.ai.typing}
        greeting={t.ai.greeting}
        suggestions={[...t.ai.suggestions]}
      />
    </div>
  );
}
