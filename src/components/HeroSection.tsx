"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BrainCircuit, CalendarClock, Globe2, ArrowRight, Play, GraduationCap, BookOpen, Award, Users } from "lucide-react";

const cyclingPrograms = ["FSc Medical", "FSc Engineering", "A/O Levels", "BS Programs", "MS Programs"];

const curricula = [
  { label: "FSc Pre-Medical" },
  { label: "FSc Pre-Engineering" },
  { label: "O Level" },
  { label: "A Level" },
  { label: "BS Degrees" },
  { label: "MS Programs" },
  { label: "Oxford Curriculum" },
  { label: "Physics" },
  { label: "Chemistry" },
  { label: "Biology" },
  { label: "Mathematics" },
  { label: "Computer Science" },
];

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cyclingPrograms.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const featureCards = [
    { icon: BrainCircuit, text: "AI-Powered Learning", color: "text-primary" },
    { icon: Sparkles, text: "Expert Teachers", color: "text-accent" },
    { icon: CalendarClock, text: "Regular & Weekend Classes", color: "text-primary" },
    { icon: Globe2, text: "5 Countries", color: "text-accent" },
  ];

  const trustStats = [
    { icon: Users, value: "1,000+", label: "Students Enrolled" },
    { icon: GraduationCap, value: "50+", label: "Expert Teachers" },
    { icon: BookOpen, value: "30+", label: "Subjects Offered" },
    { icon: Award, value: "5★", label: "Student Rating" },
  ];

  return (
    <section className="relative pt-24 pb-0 md:pt-32 overflow-hidden min-h-[90vh] flex flex-col items-center justify-center">

      {/* Background aura glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/12 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[280px] h-[280px] bg-accent/10 rounded-full blur-[90px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-primary/8 rounded-full blur-[90px] -z-10 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 flex-1 flex flex-col">
        <div className="max-w-4xl mx-auto text-center relative z-10">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mb-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-medium text-foreground/80">Premium AI-Powered Education Platform</span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="mb-4"
          >
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
              <span className="text-foreground/70 font-bold">We teach</span>
              <br />
              <span className="inline-block overflow-hidden h-[1.15em] align-bottom">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentIndex}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.28, ease: "easeInOut" }}
                    className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary"
                  >
                    {cyclingPrograms[currentIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground/60 mt-2">
              with AI-Powered Expert Learning
            </p>
          </motion.div>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-sm md:text-base text-foreground/55 mb-7 max-w-xl mx-auto leading-relaxed"
          >
            Expert teachers, AI-powered support, and flexible regular or weekend classes — live over Google Meet for students across 5 countries.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
          >
            <a
              href="/register"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-[0_0_24px_rgba(99,102,241,0.4)]"
              data-testid="hero-book-demo"
            >
              Book a Free Demo Class
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <button
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm font-semibold text-sm hover:bg-card/70 transition-colors text-foreground/80"
              data-testid="hero-explore"
            >
              <Play className="w-3.5 h-3.5 fill-current opacity-60" />
              Explore Subjects
            </button>
          </motion.div>

          {/* Feature chips */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 max-w-3xl mx-auto"
          >
            {featureCards.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-card/50 border border-border/50 backdrop-blur-md hover:border-primary/30 hover:bg-card/70 transition-colors cursor-default"
              >
                <div className={`p-1.5 rounded-lg bg-primary/10 ${feature.color} shrink-0`}>
                  <feature.icon className="w-4 h-4" />
                </div>
                <span className="font-medium text-xs text-foreground/75 leading-tight">{feature.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Academic transparent trust banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}
        className="w-full mt-12"
      >
        {/* Stats row */}
        <div className="border-y border-white/8 bg-white/[0.03] backdrop-blur-sm">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/8">
              {trustStats.map((stat, idx) => (
                <div key={idx} className="flex items-center justify-center gap-3 py-5 px-4">
                  <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center text-primary shrink-0">
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-foreground leading-none">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Curriculum scrolling strip */}
        <div className="relative overflow-hidden bg-gradient-to-r from-background via-primary/5 to-background border-b border-white/6 py-3">
          {/* Fade masks */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <div className="flex animate-scroll gap-6 w-max">
            {[...curricula, ...curricula].map((c, idx) => (
              <div key={idx} className="flex items-center gap-2 shrink-0 px-4 py-1.5 rounded-full bg-card/40 border border-border/40 backdrop-blur-sm">
                <GraduationCap className="w-3 h-3 text-accent shrink-0" />
                <span className="text-xs font-medium text-foreground/70 whitespace-nowrap">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
