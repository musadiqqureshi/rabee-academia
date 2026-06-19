"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ArrowRight } from "lucide-react";

export default function TopBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[80] bg-background/60 backdrop-blur-sm"
            onClick={() => setVisible(false)}
          />

          {/* Popup card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[90] flex items-center justify-center pointer-events-none px-4"
          >
            <div className="pointer-events-auto relative w-full max-w-md rounded-2xl border border-primary/30 bg-card/80 backdrop-blur-xl shadow-[0_0_60px_rgba(99,102,241,0.25)] overflow-hidden">

              {/* Glow strip at top */}
              <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary" />

              {/* Close button */}
              <button
                onClick={() => setVisible(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                data-testid="banner-close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="px-8 py-8 text-center">
                {/* Icon badge — centered */}
                <div className="flex justify-center mb-5">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/15 border border-primary/25">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="text-xs font-semibold text-accent uppercase tracking-wider">Limited Time</span>
                </div>

                <h2 className="text-2xl font-extrabold text-foreground mb-2 leading-tight">
                  July 2025 Batch
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                    Now Open
                  </span>
                </h2>

                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Seats are filling fast for our July intake. Join thousands of students across 5 countries learning FSc, A/O Levels, BS & MS with expert teachers and AI-powered support.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:opacity-90 transition-opacity"
                    data-testid="popup-book-demo"
                  >
                    Book Free Demo
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setVisible(false)}
                    className="flex-1 px-5 py-2.5 rounded-lg border border-border bg-muted/40 text-foreground/70 font-medium text-sm hover:bg-muted transition-colors"
                    data-testid="popup-dismiss"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
