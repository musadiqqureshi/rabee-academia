import React from "react";
import { motion } from "framer-motion";

export default function CountriesSection() {
  const countries = [
    { name: "Pakistan", flag: "🇵🇰", count: "500+" },
    { name: "India", flag: "🇮🇳", count: "200+" },
    { name: "United Kingdom", flag: "🇬🇧", count: "150+" },
    { name: "America", flag: "🇺🇸", count: "100+" },
    { name: "Canada", flag: "🇨🇦", count: "50+" },
  ];

  return (
    <section className="py-24 bg-muted/10 border-y border-border">
      <div className="container mx-auto px-4 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-12"
        >
          Trusted by Students Across <span className="text-primary">5 Countries</span>
        </motion.h2>

        <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
          {countries.map((country, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-4 py-3 px-6 rounded-full bg-card border border-border shadow-sm hover:border-primary/50 transition-colors"
            >
              <span className="text-2xl">{country.flag}</span>
              <div className="text-left">
                <p className="font-semibold text-foreground text-sm leading-tight">{country.name}</p>
                <p className="text-xs text-muted-foreground">{country.count} students</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
