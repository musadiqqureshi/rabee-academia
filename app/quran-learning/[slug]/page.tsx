import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QURAN_COURSES, getQuranCourse, PRICE_LAUNCH } from "@/lib/quranContent";
import QuranCourseContent from "./QuranCourseContent";

export function generateStaticParams() {
  return QURAN_COURSES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = getQuranCourse(slug);
  if (!course) return { title: "Quran Course — Rabee Academia" };
  return {
    title: `${course.name.en} — Online Quran Course | Rabee Academia`,
    description: `${course.intro.en} One-to-one online classes with certified teachers — PKR 5,000/month launch offer.`,
    alternates: { canonical: `/quran-learning/${slug}` },
    openGraph: {
      title: `${course.name.en} — Rabee Academia`,
      description: course.tagline.en,
      url: `/quran-learning/${slug}`,
      type: "website",
    },
  };
}

export default async function QuranCoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getQuranCourse(slug);
  if (!course) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Course",
        name: course.name.en,
        description: course.intro.en,
        provider: { "@type": "Organization", name: "Rabee Academia", sameAs: "https://rabeeacademia.site" },
        offers: { "@type": "Offer", price: String(PRICE_LAUNCH), priceCurrency: "PKR", category: "Monthly subscription" },
        hasCourseInstance: { "@type": "CourseInstance", courseMode: "online" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://rabeeacademia.site" },
          { "@type": "ListItem", position: 2, name: "Quran Learning", item: "https://rabeeacademia.site/quran-learning" },
          { "@type": "ListItem", position: 3, name: course.name.en, item: `https://rabeeacademia.site/quran-learning/${slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <QuranCourseContent slug={slug} />
    </>
  );
}
