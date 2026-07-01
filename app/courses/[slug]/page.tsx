import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Users, Sparkles, GraduationCap,
  Clock, CalendarDays, BookOpen,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnforceTheme from "@/components/EnforceTheme";
import { courses, getCourse, subjectToCourse, formatPrice, type Course } from "@/lib/courses";
import { buildOutline } from "@/lib/courseOutline";
import { createClient } from "@/lib/supabase/server";

export function generateStaticParams() {
  return courses.filter((c) => !c.slug.startsWith("quran-")).map((c) => ({ slug: c.slug }));
}

// Resolve a course by slug from the static catalog, falling back to the public
// `subjects` table for admin-added subjects.
async function resolve(slug: string): Promise<Course | null> {
  const stat = getCourse(slug);
  if (stat) return stat;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("subjects")
      .select("slug, name, level, regular_price, weekend_price, lessons, description, is_active")
      .eq("slug", slug).eq("is_active", true).maybeSingle();
    if (data) return subjectToCourse(data);
  } catch { /* ignore */ }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await resolve(slug);
  if (!course) return { title: "Course — Rabee Academia" };
  return {
    title: `${course.name} (${course.level}) — Course Outline | Rabee Academia`,
    description: `${course.description} Live one-to-one online classes with expert teachers, AI study support and exam preparation.`,
    alternates: { canonical: `/courses/${slug}` },
    openGraph: {
      title: `${course.name} — Rabee Academia`,
      description: course.description,
      url: `/courses/${slug}`,
      type: "website",
    },
  };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Quran courses have their own richer bilingual pages.
  if (slug.startsWith("quran-")) redirect(`/quran-learning/${slug}`);

  const course = await resolve(slug);
  if (!course) notFound();

  const Icon = course.icon;
  const outline = buildOutline(course);
  const discounted = !course.free ? Math.round(course.regularPrice * 0.8) : 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Course",
        name: course.name,
        description: course.description,
        educationalLevel: course.level,
        provider: { "@type": "Organization", name: "Rabee Academia", sameAs: "https://rabeeacademia.site" },
        ...(course.free ? {} : {
          offers: { "@type": "Offer", price: course.regularPrice, priceCurrency: "PKR", category: "monthly" },
        }),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://rabeeacademia.site" },
          { "@type": "ListItem", position: 2, name: "Courses", item: "https://rabeeacademia.site/pricing" },
          { "@type": "ListItem", position: 3, name: course.name, item: `https://rabeeacademia.site/courses/${slug}` },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <EnforceTheme mode="site" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <div className="pt-28 pb-20 container mx-auto px-4 md:px-6 max-w-4xl">
        <Link href="/pricing" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> All courses
        </Link>

        {/* Hero */}
        <div className={`rounded-3xl bg-gradient-to-br ${course.gradient} p-[1.5px] shadow-2xl mb-10`}>
          <div className="rounded-[calc(1.5rem-1.5px)] bg-card/95 backdrop-blur-sm p-7 md:p-9">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className={`w-16 h-16 rounded-2xl grid place-items-center shrink-0 bg-gradient-to-br ${course.gradient} text-white`}>
                <Icon className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-bold mb-2">{course.level}</span>
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">{course.name}</h1>
                <p className="text-sm text-muted-foreground mt-1">{course.lessons} lessons · Live one-to-one · AI study support</p>
              </div>
              <div className="text-start md:text-end shrink-0">
                {course.free ? (
                  <p className="text-3xl font-extrabold">Free</p>
                ) : (
                  <>
                    <p className="text-3xl font-extrabold">{formatPrice(course.regularPrice)}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                    <p className="text-[11px] text-emerald-600 font-semibold">🎉 20% off first course → {formatPrice(discounted)}</p>
                  </>
                )}
                {course.comingSoon ? (
                  <span className="mt-3 inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-bold">Coming Soon</span>
                ) : (
                  <Link href={`/enroll?subject=${course.slug}&type=regular`}
                    className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-bold hover:opacity-90">
                    Enroll Now <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed mt-6">{outline.intro}</p>
          </div>
        </div>

        {/* Outline + sidebar */}
        <div className="grid md:grid-cols-[1.5fr_1fr] gap-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-extrabold mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> Course outline</h2>
            <ol className="space-y-3">
              {outline.modules.map((m, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold grid place-items-center shrink-0">{i + 1}</span>
                  <span className="text-sm pt-0.5">{m}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-base font-extrabold mb-2 flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Who is this for?</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{outline.whoFor}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-base font-extrabold mb-3 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-primary" /> What you&apos;ll achieve</h2>
              <ul className="space-y-2">
                {outline.outcomes.map((o, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {o}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-base font-extrabold mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> What&apos;s included</h2>
              <ul className="space-y-2">
                {outline.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80"><CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {h}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Enroll CTA */}
        {!course.comingSoon && (
          <div className="mt-10 rounded-3xl bg-gradient-to-r from-primary to-accent p-[1.5px]">
            <div className="rounded-[calc(1.5rem-1.5px)] bg-card/95 p-8 text-center">
              <h2 className="text-xl md:text-2xl font-extrabold mb-2">Ready to start {course.name}?</h2>
              <p className="text-sm text-muted-foreground mb-5">Pick weekday or weekend live classes — first course is 20% off.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href={`/enroll?subject=${course.slug}&type=regular`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-bold hover:opacity-90">
                  <Clock className="w-4 h-4" /> Enroll · Regular
                </Link>
                <Link href={`/enroll?subject=${course.slug}&type=weekend`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-sm font-bold hover:bg-muted">
                  <CalendarDays className="w-4 h-4" /> Enroll · Weekend
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
