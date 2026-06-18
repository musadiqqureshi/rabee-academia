"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserPlus, BookOpenCheck, CalendarDays, Video, GraduationCap } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    { icon: UserPlus, title: "Create Account", desc: "Sign up in seconds" },
    { icon: BookOpenCheck, title: "Choose Subject", desc: "Browse our curriculum" },
    { icon: CalendarDays, title: "Select Schedule", desc: "Regular or Weekend" },
    { icon: Video, title: "Book Demo", desc: "Try a free class" },
    { icon: GraduationCap, title: "Start Learning", desc: "Join via Google Meet" }
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-16"
        >
          How Learning Works
        </motion.h2>

        <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-8 md:gap-4 relative max-w-5xl mx-auto">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-8 left-12 right-12 h-0.5 bg-border -z-10"></div>

          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center w-full md:w-1/5 relative"
            >
              <div className="w-16 h-16 rounded-full bg-card border-2 border-primary text-primary flex items-center justify-center mb-4 shadow-lg z-10 relative">
                <step.icon className="w-7 h-7" />
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </div>
              </div>
              <h3 className="font-bold text-foreground mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}