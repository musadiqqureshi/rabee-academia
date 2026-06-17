import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";

export default function TopBanner() {
  const [visible, setVisible] = useState(true);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-[60] bg-gradient-to-r from-primary via-accent/80 to-primary overflow-hidden"
        >
          <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-3 text-white text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-white/90" />
            <span>
              Limited seats for July 2025 batch — Book your free demo class today!
            </span>
            <button
              onClick={() => setVisible(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
              data-testid="banner-close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
