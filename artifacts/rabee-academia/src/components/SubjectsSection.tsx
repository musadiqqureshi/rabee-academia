"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Atom, FlaskConical, Calculator, Monitor, Dna, Telescope, Sigma, Microscope } from "lucide-react";

const courses = [
  {
    level: "FSc Level",
    name: "FSc Physics",
    lessons: 48,
    price: "PKR 7,000",
    icon: Atom,
    gradient: "from-indigo-600 via-blue-500 to-indigo-700",
    iconBg: "bg-white/10",
    iconColor: "text-white",
    decorColor: "bg-white/5",
  },
  {
    level: "A Level",
    name: "A Level Chemistry",
    lessons: 60,
    price: "PKR 15,000",
    icon: FlaskConical,
    gradient: "from-cyan-500 via-teal-400 to-cyan-600",
    iconBg: "bg-white/10",
    iconColor: "text-white",
    decorColor: "bg-white/5",
  },
  {
    level: "O Level",
    name: "O Level Mathematics",
    lessons: 52,
    price: "PKR 15,000",
    icon: Calculator,
    gradient: "from-orange-500 via-amber-400 to-orange-600",
    iconBg: "bg-white/10",
    iconColor: "text-white",
    decorColor: "bg-white/5",
  },
  {
    level: "BS Level",
    name: "BS Computer Science",
    lessons: 70,
    price: "PKR 10,000",
    icon: Monitor,
    gradient: "from-purple-600 via-violet-500 to-purple-700",
    iconBg: "bg-white/10",
    iconColor: "text-white",
    decorColor: "bg-white/5",
  },
  {
    level: "FSc Level",
    name: "FSc Biology",
    lessons: 45,
    price: "PKR 7,000",
    icon: Dna,
    gradient: "from-emerald-500 via-green-400 to-emerald-600",
    iconBg: "bg-white/10",
    iconColor: "text-white",
    decorColor: "bg-white/5",
  },
  {
    level: "A Level",
    name: "A Level Physics",
    lessons: 58,
    price: "PKR 15,000",
    icon: Telescope,
    gradient: "from-rose-500 via-pink-500 to-red-600",
    iconBg: "bg-white/10",
    iconColor: "text-white",
    decorColor: "bg-white/5",
  },
];

export default function SubjectsSection() {
  return (
    <section className="py-20" id="subjects">
      <div className="container mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-extrabold text-foreground mb-2"
            >
              Popular Courses
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="text-muted-foreground text-sm md:text-base"
            >
              Hand-picked courses across every level. Fees are per subject, per month.
            </motion.p>
          </div>
          <motion.button
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-semibold hover:bg-muted transition-colors whitespace-nowrap"
            data-testid="button-view-all-subjects"
          >
            View all <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course, idx) => {
            const Icon = course.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-2xl overflow-hidden bg-card border border-border hover:border-border/80 transition-all cursor-pointer group"
                data-testid={`card-course-${idx}`}
              >
                {/* Gradient image area */}
                <div className={`relative h-44 bg-gradient-to-br ${course.gradient} flex items-center justify-center overflow-hidden`}>
                  {/* Decorative circles */}
                  <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/8" />
                  <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-black/10" />
                  <div className="absolute top-1/2 right-6 w-16 h-16 rounded-full bg-white/5" />

                  {/* Level badge */}
                  <span className="absolute top-3.5 left-3.5 px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-sm text-white text-xs font-semibold tracking-wide">
                    {course.level}
                  </span>

                  {/* Subject icon */}
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`w-20 h-20 rounded-2xl ${course.iconBg} backdrop-blur-sm flex items-center justify-center border border-white/15 shadow-lg`}>
                      <Icon className={`w-10 h-10 ${course.iconColor} drop-shadow-lg`} strokeWidth={1.4} />
                    </div>
                  </div>
                </div>

                {/* Content area */}
                <div className="p-5">
                  <h3 className="text-base font-bold text-foreground mb-1">{course.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    {course.lessons} lessons · Live + recorded
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-extrabold text-foreground">{course.price}</span>
                      <span className="text-xs text-muted-foreground ml-1">/mo</span>
                    </div>
                    <button
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-colors group-hover:gap-2.5"
                      data-testid={`button-enroll-${idx}`}
                    >
                      Enroll <ArrowRight className="w-3.5 h-3.5 transition-all" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}