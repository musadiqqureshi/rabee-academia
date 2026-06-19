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

  const scrollItems = [...partners, ...partners];

  return (
    <div className="py-10 bg-background border-b border-border overflow-hidden">
      <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-widest mb-6">
        Our Academic Partners
      </p>
      <div className="relative w-full flex overflow-hidden group">
        <div className="flex animate-scroll whitespace-nowrap group-hover:[animation-play-state:paused]">
          {scrollItems.map((partner, idx) => (
            <div key={idx} className="flex items-center justify-center mx-10">
              <span className="text-xl md:text-2xl font-bold text-muted-foreground/40">{partner}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
