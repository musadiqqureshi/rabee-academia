"use client";

import React from "react";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20 z-0"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-card/60 backdrop-blur-xl border border-primary/30 p-10 md:p-16 rounded-3xl text-center shadow-2xl"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
            Start Your Learning Journey with Rabee Academia
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of students achieving academic excellence through our expert-led, AI-enhanced platform. Your future starts here.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-8 py-4 rounded-lg bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors shadow-lg">
              Book Demo Class
            </button>
            <button className="px-8 py-4 rounded-lg bg-background text-foreground border border-border font-bold text-lg hover:bg-muted transition-colors">
              Explore Subjects
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}