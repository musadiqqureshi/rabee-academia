"use client";

import React from "react";
import { motion } from "framer-motion";

export default function LeadershipSection() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Guided by Experts
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg"
          >
            Our leadership combines deep academic knowledge with production-grade tech experience.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Founder */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-6 items-start sm:items-center p-8 rounded-2xl bg-card border border-border"
          >
            <div className="w-24 h-24 shrink-0 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              MQ
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">Muhammad Mussaddiq Ahmed Qureshi</h3>
              <p className="text-primary font-medium mb-3">Founder & CEO</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Senior Python Developer & Big Data Engineer with 7+ years IT experience. 400+ projects delivered across Healthcare, Aviation, Finance, and Logistics. Founded Rabee Academia to merge AI with elite education.
              </p>
            </div>
          </motion.div>

          {/* Co-Founder */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-6 items-start sm:items-center p-8 rounded-2xl bg-card border border-border"
          >
            <div className="w-24 h-24 shrink-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              IM
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">Isra Musadiq</h3>
              <p className="text-primary font-medium mb-3">Co-Founder & Academic Lead</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Physics expert with 4+ years of teaching experience. Specializes in student-centered methodologies, deep subject knowledge, and translating complex concepts into accessible learning modules.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}