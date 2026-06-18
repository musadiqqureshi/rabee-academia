"use client";

import React from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles, LineChart, Target, TrendingUp } from "lucide-react";

export default function AISection() {
  const features = [
    {
      icon: Brain,
      title: "Smart Study Guidance",
      description: "AI-driven curriculum planning adapted to your individual learning pace."
    },
    {
      icon: Sparkles,
      title: "Personalized Support",
      description: "Tailored resources and explanations to target your specific weak areas."
    },
    {
      icon: LineChart,
      title: "Progress Insights",
      description: "Deep analytics on your performance, attendance, and mastery of concepts."
    },
    {
      icon: Target,
      title: "Practice Support",
      description: "Intelligent generation of practice questions based on past papers."
    },
    {
      icon: TrendingUp,
      title: "Improvement Tracking",
      description: "Visual roadmaps showing your journey from basics to advanced mastery."
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6"
          >
            Empowered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">Artificial Intelligence</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            We blend the expertise of top educators with advanced AI tools to create a learning environment that adapts to you.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 relative overflow-hidden ${idx === 4 ? 'lg:col-span-2 lg:col-start-2' : ''}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}