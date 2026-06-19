"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BrainCircuit, CalendarClock, Globe2, ArrowRight, Play } from "lucide-react";

const cyclingPrograms = ["FSc Medical", "FSc Engineering", "A/O Levels", "BS Programs", "MS Programs"];

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
    { icon: Globe2, text: "Students From 5 Countries", color: "text-accent" },
  ];

  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden min-h-[88vh] flex items-center">
      {/* Background aura glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/15 rounded-full blur-[130px] -z-10 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-accent/15 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center relative z-10">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-medium text-foreground/80">Premium AI-Powered Education Platform</span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="mb-4"
          >
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
          </motion.div>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.1 }}
            className="text-sm md:text-base text-foreground/60 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Expert teachers, AI-powered academic support, and flexible regular or weekend classes — delivered live over Google Meet for students across 5 countries.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.15 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <motion.button
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-[0_0_28px_rgba(99,102,241,0.35)] hover:shadow-[0_0_40px_rgba(99,102,241,0.55)]"
              data-testid="hero-book-demo"
            >
              Book a Demo Class
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg border border-border bg-background/50 backdrop-blur-sm font-semibold text-sm hover:bg-muted transition-all text-foreground"
              data-testid="hero-explore"
            >
              <Play className="w-3.5 h-3.5 fill-current opacity-70" />
              Explore Subjects
            </motion.button>
          </motion.div>
        </div>

        {/* Feature Cards */}
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
          {featureCards.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.05, duration: 0.25 }}
              whileHover={{ y: -4, transition: { duration: 0.15 } }}
              className="flex items-center gap-2.5 p-3.5 rounded-xl bg-card/60 border border-border backdrop-blur-md hover:border-primary/40 hover:bg-card transition-all cursor-default"
            >
              <div className={`p-1.5 rounded-lg bg-primary/10 ${feature.color} shrink-0`}>
                <feature.icon className="w-4 h-4" />
              </div>
              <span className="font-medium text-xs text-foreground/80 leading-tight">{feature.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
