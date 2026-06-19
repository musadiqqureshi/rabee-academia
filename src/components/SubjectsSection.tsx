"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { courses } from "@/lib/courses";

const featured = courses.slice(0, 6);

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
              Hand-picked courses across every level — click Enroll to see full pricing.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link
              href="/pricing"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-semibold hover:bg-muted transition-colors whitespace-nowrap"
            >
              View all courses <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((course, idx) => {
            const Icon = course.icon;
            return (
              <motion.div
                key={course.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.07 }}
                whileHover={{ y: -4, transition: { duration: 0.18 } }}
                className="rounded-2xl overflow-hidden bg-card border border-border hover:border-border/80 transition-all cursor-pointer group"
              >
                {/* Gradient image area */}
                <div className={`relative h-44 bg-gradient-to-br ${course.gradient} flex items-center justify-center overflow-hidden`}>
                  <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/8" />
                  <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-black/10" />
                  <div className="absolute top-1/2 right-6 w-16 h-16 rounded-full bg-white/5" />
                  <span className="absolute top-3.5 left-3.5 px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-sm text-white text-xs font-semibold tracking-wide">
                    {course.level}
                  </span>
                  <div className="relative z-10">
                    <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/15 shadow-lg">
                      <Icon className="w-10 h-10 text-white drop-shadow-lg" strokeWidth={1.4} />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-base font-bold text-foreground mb-1">{course.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    {course.lessons} lessons · Live + recorded
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Regular &amp; weekend options</p>
                    <Link
                      href={`/pricing?subject=${course.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-colors group-hover:gap-2.5"
                    >
                      Enroll <ArrowRight className="w-3.5 h-3.5 transition-all" />
                    </Link>
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
