"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Self-hosted educational banners (public/hero). Background only — no text baked in.
const slides = [
  { src: "/hero/01-online-classes.jpg",   alt: "Students studying in online classes" },
  { src: "/hero/02-fsc-science.jpg",       alt: "FSc Pre-Medical and Pre-Engineering students" },
  { src: "/hero/03-classroom.jpg",         alt: "O Level and A Level classroom environment" },
  { src: "/hero/04-university-online.jpg", alt: "University students learning online" },
  { src: "/hero/05-ai-technology.jpg",     alt: "AI and technology learning environment" },
  { src: "/hero/06-teacher-live.jpg",      alt: "Teachers conducting live classes" },
  { src: "/hero/07-international.jpg",      alt: "International education theme" },
];

const ROTATE_MS = 5000;

export default function HeroBackgroundSlider() {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((next: number) => {
    setIndex((next + slides.length) % slides.length);
  }, []);

  const restart = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, ROTATE_MS);
  }, []);

  useEffect(() => {
    restart();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [restart]);

  const handleNav = (next: number) => {
    go(next);
    restart(); // reset the 5s clock after manual interaction
  };

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="false">
      {/* Stacked images, cross-faded via opacity */}
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === index ? 1 : 0 }}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            loading={i === 0 ? "eager" : "lazy"}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ))}

      {/* Readability overlay: dark gradient tuned for the dark theme */}
      <div className="absolute inset-0 bg-background/80" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background/90" />

      {/* Manual navigation arrows */}
      <button
        type="button"
        onClick={() => handleNav(index - 1)}
        aria-label="Previous banner"
        className="pointer-events-auto absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-10 grid place-items-center w-9 h-9 md:w-11 md:h-11 rounded-full bg-background/40 border border-border backdrop-blur-md text-foreground/80 hover:bg-background/70 hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => handleNav(index + 1)}
        aria-label="Next banner"
        className="pointer-events-auto absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-10 grid place-items-center w-9 h-9 md:w-11 md:h-11 rounded-full bg-background/40 border border-border backdrop-blur-md text-foreground/80 hover:bg-background/70 hover:text-foreground transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Navigation dots */}
      <div className="pointer-events-auto absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => handleNav(i)}
            aria-label={`Go to banner ${i + 1}`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-6 bg-primary" : "w-2 bg-foreground/30 hover:bg-foreground/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
