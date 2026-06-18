"use client";

import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, Atom, Calculator, Laptop, Beaker } from "lucide-react";

export default function ProgramsSection() {
  const programs = [
    { title: "FSc Pre-Medical", icon: Beaker, color: "text-rose-500", bg: "bg-rose-500/10" },
    { title: "FSc Pre-Engineering", icon: Calculator, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "A/O Levels", icon: GraduationCap, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "BS Physics", icon: Atom, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { title: "BS Computer Science", icon: Laptop, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "BS Mathematics", icon: Calculator, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "MS Physics", icon: Atom, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { title: "MS Computer Science", icon: Laptop, color: "text-teal-500", bg: "bg-teal-500/10" },
    { title: "MS Mathematics", icon: Calculator, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Programs Offered
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            Comprehensive curriculums designed for academic excellence across multiple disciplines.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {programs.map((program, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors group cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${program.bg} ${program.color} group-hover:scale-110 transition-transform`}>
                <program.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground/90 group-hover:text-primary transition-colors">{program.title}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}