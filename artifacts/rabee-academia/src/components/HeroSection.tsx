import React from "react";
import { motion } from "framer-motion";
import { Sparkles, BrainCircuit, CalendarClock, Globe2 } from "lucide-react";

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden min-h-[90vh] flex items-center">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          className="max-w-4xl mx-auto text-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary-foreground backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Premium AI-Powered Education</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-8 leading-tight"
          >
            Master FSc, A/O Levels, BS & MS Subjects with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">AI-Powered Expert Learning</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-foreground/70 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Rabee Academia provides modern online learning for FSc Medical, FSc Engineering, A/O Levels, BS, and MS students with expert teachers, AI-powered academic support, and flexible regular or weekend classes.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              className="w-full sm:w-auto px-8 py-4 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-lg hover:opacity-90 transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)]"
              data-testid="hero-book-demo"
            >
              Book a Demo Class
            </button>
            <button
              className="w-full sm:w-auto px-8 py-4 rounded-lg border-2 border-border bg-background/50 backdrop-blur-sm font-semibold text-lg hover:bg-muted transition-all text-foreground"
              data-testid="hero-explore"
            >
              Explore Subjects
            </button>
          </motion.div>
        </motion.div>

        {/* Floating Mini Cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {[
            { icon: BrainCircuit, text: "AI-Powered Learning" },
            { icon: Sparkles, text: "Expert Teachers" },
            { icon: CalendarClock, text: "Regular & Weekend Classes" },
            { icon: Globe2, text: "Students From 5 Countries" },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + idx * 0.1, duration: 0.5 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-border backdrop-blur-md hover:bg-card hover:border-primary/50 transition-colors"
            >
              <div className="p-2 rounded-lg bg-primary/20 text-primary">
                <feature.icon className="w-5 h-5" />
              </div>
              <span className="font-medium text-sm text-foreground/90">{feature.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
