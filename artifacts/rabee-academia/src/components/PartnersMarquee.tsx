import React from "react";

export default function PartnersMarquee() {
  const partners = [
    "Tech Solutions Pakistan",
    "Rabee Academia",
    "AI Learning Network",
    "Future Scholars Hub",
    "Global STEM Academy",
    "Digital Learning Partners",
  ];

  // Duplicate for seamless loop
  const scrollItems = [...partners, ...partners];

  return (
    <div className="py-12 bg-background border-b border-border overflow-hidden flex items-center">
      <div className="container mx-auto px-4 mb-4">
         <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-widest mb-6">Our Academic Partners</p>
      </div>
      <div className="relative w-full flex overflow-hidden group">
        <div className="flex animate-scroll whitespace-nowrap group-hover:[animation-play-state:paused]">
          {scrollItems.map((partner, idx) => (
            <div key={idx} className="flex items-center justify-center mx-8">
              <span className="text-xl md:text-2xl font-bold text-muted-foreground/40">{partner}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
