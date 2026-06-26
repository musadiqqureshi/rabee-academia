import type { Metadata } from "next";
import QuranLearningContent from "./QuranLearningContent";

export const metadata: Metadata = {
  title: "Quran Learning Online — Expert Teachers + AI Revision | Rabee Academia",
  description:
    "Personalized one-to-one online Quran classes for children and adults. Learn Noorani Qaida, Nazra, Tajweed, Hifz support and Islamic Studies with certified male & female teachers, enhanced by AI-powered revision tools. Book a free assessment.",
  keywords: [
    "online Quran classes", "learn Quran online", "Noorani Qaida", "Nazra Quran",
    "Tajweed online", "Hifz support", "Islamic studies", "female Quran teacher",
    "one to one Quran classes", "Quran learning with AI",
  ],
  alternates: { canonical: "/quran-learning" },
  openGraph: {
    title: "Learn the Holy Quran with Expert Teachers & AI-Powered Learning",
    description:
      "One-to-one online Quran classes for kids & adults — Noorani Qaida, Nazra, Tajweed, Hifz & Islamic Studies with certified teachers and AI revision tools.",
    url: "/quran-learning",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Online Quran Learning — Rabee Academia",
  description:
    "Personalized one-to-one online Quran classes: Noorani Qaida, Nazra, Tajweed, Hifz support and Islamic Studies with certified teachers and AI-powered revision tools.",
  provider: { "@type": "Organization", name: "Rabee Academia", sameAs: "https://rabeeacademia.site" },
  offers: { "@type": "Offer", price: "5000", priceCurrency: "PKR", category: "Monthly subscription" },
  hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: "PT4H" },
};

export default function QuranLearningPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <QuranLearningContent />
    </>
  );
}
