import React from "react";

export default function ReviewsMarquee() {
  const reviews = [
    { name: "Ahmed R.", flag: "🇵🇰", subject: "FSc Physics", text: "The AI tools helped me identify exactly which topics I needed to focus on before my boards." },
    { name: "Sarah J.", flag: "🇬🇧", subject: "A Levels Math", text: "Brilliant tutors. The weekend classes fit perfectly with my schedule." },
    { name: "Rahul M.", flag: "🇮🇳", subject: "BS Computer Science", text: "Learned more in 3 months here than in my entire first year of university." },
    { name: "Michael T.", flag: "🇺🇸", subject: "MS Physics", text: "Expert guidance for my advanced topics. The 1-on-1 sessions are invaluable." },
    { name: "Ayesha K.", flag: "🇨🇦", subject: "O Levels Chemistry", text: "Interactive and engaging classes. I actually look forward to studying now!" },
  ];

  const scrollItems = [...reviews, ...reviews];

  return (
    <section className="py-24 overflow-hidden relative bg-muted/20">
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-muted/20 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-muted/20 to-transparent z-10 pointer-events-none"></div>
      
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold">Student Success Stories</h2>
      </div>

      <div className="flex w-full">
        <div className="flex animate-scroll whitespace-nowrap hover:[animation-play-state:paused]">
          {scrollItems.map((review, idx) => (
            <div key={idx} className="w-[350px] mx-4 p-6 rounded-2xl bg-card border border-border shrink-0 flex flex-col whitespace-normal">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-foreground flex items-center gap-2">
                    {review.name} <span>{review.flag}</span>
                  </h4>
                  <p className="text-xs text-primary font-medium">{review.subject}</p>
                </div>
                <div className="text-yellow-500 text-sm">⭐⭐⭐⭐⭐</div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic">"{review.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
