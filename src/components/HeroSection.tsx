"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, BrainCircuit, CalendarClock, Globe2, ArrowRight, Play } from "lucide-react";
import HeroBackgroundSlider from "./HeroBackgroundSlider";

const cyclingPrograms = ["FSc Medical", "FSc Engineering", "A/O Levels", "BS Programs", "MS Programs", "Quran Pak"];

const featureCards = [
  { icon: BrainCircuit, text: "AI-Powered Learning",          color: "text-primary" },
  { icon: Sparkles,     text: "Expert Teachers",              color: "text-accent" },
  { icon: CalendarClock,text: "Regular & Weekend Classes",    color: "text-primary" },
  { icon: Globe2,       text: "Students From 5 Countries",    color: "text-accent" },
];

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cyclingPrograms.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative pt-36 pb-16 md:pt-44 md:pb-24 overflow-hidden min-h-[88vh] flex items-center">
      {/* Full-width auto-rotating educational banner slider (background only) */}
      <HeroBackgroundSlider />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center relative z-10">

          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-medium text-foreground/80">Premium AI-Powered Education Platform</span>
          </div>

          {/* Headline */}
          <div className="mb-4">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              <span className="text-foreground">We teach</span>
              <br />
              <span className="inline-block overflow-hidden h-[1.2em] align-bottom">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentIndex}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary"
                  >
                    {cyclingPrograms[currentIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
              <br />
              <span className="text-foreground/90 text-2xl md:text-3xl lg:text-4xl font-bold">
                with AI-Powered Expert Learning
              </span>
            </h1>
          </div>

          {/* Subheading */}
          <p className="text-sm md:text-base text-foreground/60 mb-8 max-w-2xl mx-auto leading-relaxed">
            Expert teachers, AI-powered academic support, and flexible regular or weekend classes — delivered live over Google Meet for students across 5 countries.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/demo"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-[0_0_28px_rgba(99,102,241,0.35)]"
            >
              Book a Demo Class for Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/#subjects"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg border border-border bg-background/50 backdrop-blur-sm font-semibold text-sm hover:bg-muted transition-colors text-foreground"
            >
              <Play className="w-3.5 h-3.5 fill-current opacity-70" />
              Explore Subjects
            </Link>
          </div>
        </div>

        {/* Feature Cards — no animation, just instant render */}
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
          {featureCards.map((feature) => (
            <div
              key={feature.text}
              className="flex items-center gap-2.5 p-3.5 rounded-xl bg-card/60 border border-border backdrop-blur-md hover:border-primary/40 hover:bg-card transition-all cursor-default"
            >
              <div className={`p-1.5 rounded-lg bg-primary/10 ${feature.color} shrink-0`}>
                <feature.icon className="w-4 h-4" />
              </div>
              <span className="font-medium text-xs text-foreground/80 leading-tight">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Academic trust strip */}
        <div className="mt-10 max-w-5xl mx-auto rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/15 to-primary/20 backdrop-blur-md" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 px-7 py-5">
            <div className="text-center sm:text-left">
              <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-0.5">Pakistan&apos;s Premier Online Academy</p>
              <p className="text-base font-bold text-foreground">
                Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">1,000+ students</span> across 5 countries
              </p>
            </div>
            <div className="flex items-center gap-6 shrink-0">
              {[
                { value: "FSc",   sub: "Pre-Med & Eng" },
                { value: "A/O",   sub: "Level Oxford" },
                { value: "BS/MS", sub: "Degree Programs" },
              ].map((item) => (
                <div key={item.value} className="text-center">
                  <p className="text-lg font-extrabold text-foreground leading-none">{item.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 whitespace-nowrap">{item.sub}</p>
                </div>
              ))}
            </div>
            <Link
              href="/enroll"
              className="shrink-0 px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-[0_0_16px_rgba(99,102,241,0.35)] whitespace-nowrap"
            >
              Enroll Now →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
