import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function PricingSection() {
  const plans = [
    {
      name: "FSc Subjects",
      price: "7,000",
      period: "per subject / month",
      features: ["Live Interactive Classes", "AI Study Material", "Regular Assessments", "Doubt Clearing Sessions"]
    },
    {
      name: "BS Subjects",
      price: "10,000",
      period: "per subject / month",
      popular: true,
      features: ["Advanced Curriculum", "Project Assistance", "Research Guidance", "1-on-1 Mentoring"]
    },
    {
      name: "A/O Levels",
      price: "15,000",
      period: "per subject / month",
      features: ["Exam-focused Strategy", "Past Paper Practice", "Mock Exams", "Progress Reports"]
    },
    {
      name: "MS Subjects",
      price: "Custom",
      period: "Contact Admin",
      features: ["Thesis Support", "Specialized Topics", "Flexible Scheduling", "Expert Consultation"]
    }
  ];

  return (
    <section className="py-24 bg-muted/20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Transparent Pricing
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            Choose regular or weekend classes. Premium education, accessible pricing.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`relative p-8 rounded-2xl border ${plan.popular ? 'border-primary bg-card/80 shadow-[0_0_30px_rgba(99,102,241,0.15)]' : 'border-border bg-card'} hover:border-primary/60 transition-all flex flex-col`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-medium text-muted-foreground mb-4">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold">{plan.price === "Custom" ? "Custom" : `PKR ${plan.price}`}</span>
                {plan.price !== "Custom" && <span className="text-sm text-muted-foreground block mt-1">{plan.period}</span>}
              </div>
              
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feat, fidx) => (
                  <li key={fidx} className="flex items-start gap-2 text-sm text-foreground/80">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 rounded-lg font-medium transition-colors ${plan.popular ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted hover:bg-muted/80'}`}>
                {plan.price === "Custom" ? "Contact Us" : "Enroll Now"}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
