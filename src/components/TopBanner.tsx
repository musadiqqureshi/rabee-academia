"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, X, ArrowRight } from "lucide-react";

export default function TopBanner() {
  const [visible, setVisible] = useState(true);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-[100] h-10 flex items-center justify-center px-4 bg-gradient-to-r from-primary/90 via-accent/80 to-primary/90 backdrop-blur-md border-b border-white/10 shadow-[0_2px_20px_rgba(99,102,241,0.3)]"
        >
          {/* Centered content */}
          <div className="flex items-center gap-2 text-white">
            <Clock className="w-3.5 h-3.5 shrink-0 opacity-90" />
            <span className="text-xs font-semibold tracking-wide whitespace-nowrap">
              Limited Time —
            </span>
            <span className="text-xs font-medium opacity-90 hidden sm:inline whitespace-nowrap">
              July 2025 Batch Now Open. Seats filling fast.
            </span>
            <span className="text-xs font-medium opacity-90 sm:hidden whitespace-nowrap">
              July 2025 Batch Open.
            </span>
            <button
              onClick={() => {}}
              className="hidden sm:inline-flex items-center gap-1 ml-1 text-xs font-bold underline underline-offset-2 opacity-90 hover:opacity-100 transition-opacity whitespace-nowrap"
            >
              Enroll Now <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Close — right edge */}
          <button
            onClick={() => setVisible(false)}
            className="absolute right-3 p-1 rounded-full text-white/70 hover:text-white transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
