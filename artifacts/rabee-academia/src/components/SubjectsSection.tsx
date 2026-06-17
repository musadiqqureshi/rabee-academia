import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";

export default function SubjectsSection() {
  const subjects = [
    { name: "Physics", levels: "FSc, A/O Levels, BS, MS", desc: "Classical mechanics to quantum theory." },
    { name: "Computer Science", levels: "FSc, A/O Levels, BS, MS", desc: "Programming, algorithms, and architecture." },
    { name: "Mathematics", levels: "FSc, A/O Levels, BS, MS", desc: "Calculus, algebra, and advanced logic." },
    { name: "Chemistry", levels: "FSc, A/O Levels", desc: "Organic, inorganic, and physical chemistry." },
    { name: "Biology", levels: "FSc, A/O Levels", desc: "Genetics, zoology, and human anatomy." },
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Master Your Subjects
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-lg"
            >
              Deep-dive into core sciences with expert faculty and AI-assisted practice.
            </motion.p>
          </div>
          <motion.button 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:bg-muted transition-colors font-medium whitespace-nowrap"
          >
            View All Subjects <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-2xl bg-gradient-to-b from-card to-card/50 border border-border hover:border-primary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold mb-2">{sub.name}</h3>
              <p className="text-sm text-primary font-medium mb-3">{sub.levels}</p>
              <p className="text-muted-foreground text-sm leading-relaxed">{sub.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
