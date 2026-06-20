"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, CalendarDays, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnforceTheme from "@/components/EnforceTheme";
import { courses, LEVELS, formatPrice } from "@/lib/courses";

function PricingContent() {
  const searchParams = useSearchParams();
  const highlight = searchParams.get("subject");

  const [activeLevel, setActiveLevel] = useState<string>("All");
  const [classType, setClassType] = useState<"regular" | "weekend">("regular");

  const filtered =
    activeLevel === "All"
      ? courses
      : courses.filter((c) => c.level === activeLevel);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <EnforceTheme mode="site" />
      <Navbar />

      <div className="pt-28 pb-20 container mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-foreground/80">Transparent Pricing</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.05 }}
            className="text-3xl md:text-5xl font-extrabold mb-3"
          >
            Choose Your Course
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.1 }}
            className="text-muted-foreground text-sm md:text-base"
          >
            Pick regular (weekday) or weekend classes. Fees are per subject per month.
          </motion.p>
        </div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.12 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8"
        >
          {/* Level filter */}
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setActiveLevel(lvl)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  activeLevel === lvl
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-foreground/70 hover:bg-muted"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Class type toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-card border border-border">
            <button
              onClick={() => setClassType("regular")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                classType === "regular"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Regular Classes
            </button>
            <button
              onClick={() => setClassType("weekend")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                classType === "weekend"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" /> Weekend Classes
            </button>
          </div>
        </motion.div>

        {/* Class type info strip */}
        <div className={`mb-8 px-5 py-3 rounded-xl border text-sm flex items-center gap-3 ${
          classType === "regular"
            ? "bg-primary/5 border-primary/20 text-foreground/80"
            : "bg-accent/5 border-accent/20 text-foreground/80"
        }`}>
          {classType === "regular" ? (
            <>
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <span><strong>Regular classes</strong> run on weekdays (Mon–Fri). Ideal for students with a structured daily schedule.</span>
            </>
          ) : (
            <>
              <CalendarDays className="w-4 h-4 text-accent shrink-0" />
              <span><strong>Weekend classes</strong> run on Saturday &amp; Sunday. Ideal for working students or those with weekday commitments.</span>
            </>
          )}
        </div>

        {/* Course cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((course, idx) => {
            const Icon = course.icon;
            const price = classType === "regular" ? course.regularPrice : course.weekendPrice;
            const isHighlighted = highlight === course.slug;

            return (
              <motion.div
                key={course.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.22 }}
                className={`relative flex flex-col rounded-2xl border bg-card overflow-hidden transition-all ${
                  isHighlighted
                    ? "border-primary shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {isHighlighted && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary" />
                )}

                {/* Gradient header */}
                <div className={`h-28 bg-gradient-to-br ${course.gradient} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/8" />
                  <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-black/10" />
                  <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/15">
                    <Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
                  </div>
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-semibold">
                    {course.level}
                  </span>
                  {course.badge && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-extrabold shadow">
                      {course.badge}
                    </span>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-foreground mb-1">{course.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{course.description}</p>

                  <ul className="space-y-1.5 mb-4 flex-1">
                    {course.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-foreground/75">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-border pt-4 mt-auto">
                    <div className="flex items-end justify-between mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          {course.free ? "Launching offer" : classType === "regular" ? "Weekdays" : "Sat & Sun"}
                        </p>
                        <p className="text-xl font-extrabold text-foreground">{course.free ? "Free" : formatPrice(price)}</p>
                        <p className="text-[10px] text-muted-foreground">{course.free ? "limited seats" : "per subject / month"}</p>
                      </div>
                    </div>

                    {course.comingSoon ? (
                      <span className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-muted text-muted-foreground text-xs font-bold cursor-default">
                        Coming Soon
                      </span>
                    ) : (
                      <Link
                        href={`/enroll?subject=${course.slug}&type=${classType}`}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-[0_0_16px_rgba(99,102,241,0.25)]"
                      >
                        Enroll Now <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* MS note */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          MS-level pricing shown is indicative. Contact admin for custom packages and thesis support rates.
        </p>
      </div>

      <Footer />
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={null}>
      <PricingContent />
    </Suspense>
  );
}
