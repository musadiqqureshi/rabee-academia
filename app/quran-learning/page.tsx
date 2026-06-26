import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen, ArrowRight, CheckCircle2, Users, ShieldCheck, Clock, FileText,
  BarChart3, Bot, UserCheck, Globe2, Sparkles, BookMarked, Mic2, Brain,
  CalendarCheck, ClipboardList, GraduationCap, Star, Video, Award, MessageSquare,
  CalendarClock, Layers, Languages, Heart, Phone,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnforceTheme from "@/components/EnforceTheme";
import AnimatedBackground from "@/components/AnimatedBackground";
import QuranRegisterForm from "./QuranRegisterForm";

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

// Subtle 8-point Islamic geometric pattern, tinted with currentColor.
function IslamicPattern({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      <svg className="w-full h-full text-emerald-500/[0.07]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="islamic-star" width="56" height="56" patternUnits="userSpaceOnUse" patternTransform="rotate(0)">
            <path
              d="M28 4 L34 18 L48 14 L40 28 L48 42 L34 38 L28 52 L22 38 L8 42 L16 28 L8 14 L22 18 Z"
              fill="none" stroke="currentColor" strokeWidth="1.2"
            />
            <circle cx="28" cy="28" r="3" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-star)" />
      </svg>
    </div>
  );
}

const WHY = [
  { icon: UserCheck, title: "One-to-One Live Classes", desc: "Undivided attention in every private session." },
  { icon: ShieldCheck, title: "Certified Male & Female Teachers", desc: "Qualified, vetted Quran tutors for every family." },
  { icon: Clock, title: "Flexible Class Timings", desc: "Pick slots that fit your timezone and routine." },
  { icon: FileText, title: "Weekly Homework", desc: "Structured practice that builds steady progress." },
  { icon: BarChart3, title: "Monthly Progress Reports", desc: "Clear feedback parents can actually track." },
  { icon: Bot, title: "AI Revision Assistant", desc: "Smart revision between live lessons, anytime." },
  { icon: Layers, title: "Personalized Learning Plans", desc: "A roadmap shaped around each student's goals." },
  { icon: Globe2, title: "International Students Welcome", desc: "Trusted by families across the globe." },
];

const COURSES = [
  { icon: BookOpen, name: "Noorani Qaida", desc: "Build a strong foundation for Quran reading from the very first letter.", gradient: "from-emerald-500 to-teal-600" },
  { icon: BookMarked, name: "Nazra Quran", desc: "Learn fluent, confident Quran recitation with proper flow.", gradient: "from-teal-500 to-cyan-600" },
  { icon: Mic2, name: "Tajweed", desc: "Master correct pronunciation and the rules of articulation.", gradient: "from-green-500 to-emerald-600" },
  { icon: Brain, name: "Hifz Support", desc: "Structured memorization with smart, spaced revision plans.", gradient: "from-cyan-500 to-blue-600" },
  { icon: Star, name: "Islamic Studies", desc: "Daily Duas, Salah, Islamic manners and basic Aqeedah.", gradient: "from-amber-500 to-orange-600" },
  { icon: Languages, name: "Quran Translation & Understanding", desc: "Understand selected Surahs and their meanings, age-appropriately.", gradient: "from-fuchsia-500 to-purple-600" },
];

const AI_FEATURES = [
  { icon: CalendarCheck, title: "Daily Revision" },
  { icon: ClipboardList, title: "Practice Quizzes" },
  { icon: FileText, title: "Lesson Summaries" },
  { icon: Layers, title: "Personalized Study Plans" },
  { icon: BarChart3, title: "Learning Progress Tracking" },
  { icon: Mic2, title: "Pronunciation Practice Guidance" },
  { icon: Bot, title: "24/7 Revision Support" },
];

const JOURNEY = [
  { icon: UserCheck, title: "Register Online" },
  { icon: ClipboardList, title: "Free Assessment" },
  { icon: Users, title: "Teacher Assignment" },
  { icon: CalendarClock, title: "Schedule Classes" },
  { icon: Video, title: "Live One-to-One Learning" },
  { icon: FileText, title: "Homework & Assignments" },
  { icon: BarChart3, title: "Monthly Evaluation" },
  { icon: Award, title: "Certificate of Completion" },
];

const DASHBOARD = [
  { icon: CalendarCheck, label: "Upcoming Classes" },
  { icon: Video, label: "Join Live Session" },
  { icon: FileText, label: "Homework" },
  { icon: ClipboardList, label: "Assignment Submission" },
  { icon: Bot, label: "AI Revision" },
  { icon: CalendarClock, label: "Attendance" },
  { icon: BarChart3, label: "Progress Reports" },
  { icon: MessageSquare, label: "Teacher Feedback" },
  { icon: Award, label: "Certificates" },
];

const TEACHERS = [
  { name: "Qari Abdullah", qual: "Hafiz-e-Quran · Tajweed Certified", exp: "8+ years", langs: "Arabic, Urdu, English", spec: "Tajweed & Hifz" },
  { name: "Ustadha Maryam", qual: "Alimah · Quran & Islamic Studies", exp: "6+ years", langs: "Urdu, English", spec: "Kids & Noorani Qaida" },
  { name: "Qari Bilal", qual: "Hafiz-e-Quran · Ijazah in Recitation", exp: "10+ years", langs: "Arabic, English", spec: "Nazra & Tajweed" },
];

const PRICING_INCLUDES = [
  "Live One-to-One Sessions", "Certified Quran Teacher", "Weekly Homework",
  "AI Revision Assistant", "Monthly Assessment", "Flexible Scheduling", "Progress Reports",
];

const TESTIMONIALS = [
  { name: "Sara A.", role: "Parent · UK", text: "My daughter went from struggling with Qaida to reading fluently in months. The female teacher made her so comfortable.", rating: 5 },
  { name: "Imran H.", role: "Student · Canada", text: "The Tajweed correction is excellent and the AI revision keeps me practicing between classes. Highly recommend.", rating: 5 },
  { name: "Fatima Z.", role: "Parent · USA", text: "One-to-one attention and the monthly reports keep me fully updated on my son's progress. Worth every rupee.", rating: 5 },
];

const FAQS = [
  { q: "Who can join?", a: "Anyone — children and adults, beginners to advanced. We tailor each plan to the student's current level and goals." },
  { q: "Are classes one-to-one?", a: "Yes. Every class is a private, one-to-one live session with your assigned teacher for focused attention." },
  { q: "What age groups are accepted?", a: "We welcome students of all ages, from young children (around 4+) to adults. Lessons are made age-appropriate." },
  { q: "Are female teachers available?", a: "Yes. We have certified female Quran teachers, so sisters and young girls can learn comfortably." },
  { q: "How are classes conducted?", a: "Classes run online via video call (e.g. Google Meet / Zoom) with screen sharing and digital Quran tools." },
  { q: "What is the monthly fee?", a: "One-to-one Quran learning is PKR 5,000 / month, including AI revision tools, homework and monthly assessments." },
  { q: "What devices are required?", a: "Any laptop, tablet or smartphone with a stable internet connection, a microphone and a camera." },
  { q: "Is there a free assessment?", a: "Yes. Register and we'll arrange a free assessment to gauge your level before assigning the right teacher and plan." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Online Quran Learning — Rabee Academia",
  description:
    "Personalized one-to-one online Quran classes: Noorani Qaida, Nazra, Tajweed, Hifz support and Islamic Studies with certified teachers and AI-powered revision tools.",
  provider: { "@type": "Organization", name: "Rabee Academia", sameAs: "https://rabeeacademia.site" },
  offers: { "@type": "Offer", price: "5000", priceCurrency: "PKR", category: "Monthly subscription" },
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "online",
    courseWorkload: "PT4H",
  },
};

const sectionHeading = "text-2xl md:text-4xl font-extrabold tracking-tight";

export default function QuranLearningPage() {
  return (
    <div className="dark min-h-screen text-foreground overflow-x-hidden">
      <EnforceTheme mode="site" />
      <AnimatedBackground />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="fixed top-0 inset-x-0 z-50">
        <Navbar />
      </div>

      {/* ============ Banner 1 — Hero ============ */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <IslamicPattern />
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px]" />
          <div className="absolute top-40 right-0 w-[420px] h-[420px] bg-teal-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-24 left-0 w-[420px] h-[420px] bg-primary/10 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-500 text-xs font-bold mb-5 ring-1 ring-emerald-500/25">
                <Sparkles className="w-3.5 h-3.5" /> New at Rabee Academia
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">
                Learn the Holy Quran with{" "}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
                  Expert Teachers
                </span>{" "}
                & AI-Powered Learning
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mt-5 max-w-xl">
                Personalized one-to-one online Quran classes for children and adults. Learn Noorani Qaida, Nazra, Tajweed, Hifz support and Islamic Studies with certified teachers, enhanced by AI-powered revision tools.
              </p>
              <div className="flex flex-wrap gap-3 mt-7">
                <a href="#register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold hover:opacity-90 shadow-[0_0_24px_rgba(16,185,129,0.3)]">
                  Enroll Now <ArrowRight className="w-4 h-4" />
                </a>
                <a href="#register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card/60 backdrop-blur-sm text-sm font-bold hover:bg-muted">
                  Book Free Assessment
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-5 mt-7 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Certified teachers</span>
                <span className="inline-flex items-center gap-1.5"><Users className="w-4 h-4 text-emerald-500" /> Male & female tutors</span>
                <span className="inline-flex items-center gap-1.5"><Globe2 className="w-4 h-4 text-emerald-500" /> Students worldwide</span>
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="relative rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 p-[1.5px] shadow-2xl">
                <div className="rounded-[calc(1.5rem-1.5px)] bg-card/90 backdrop-blur-sm p-6 overflow-hidden">
                  <IslamicPattern className="opacity-60" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-500 grid place-items-center"><Video className="w-4 h-4" /></div>
                        <div>
                          <p className="text-xs font-bold">Live Quran Session</p>
                          <p className="text-[10px] text-muted-foreground">One-to-one · Tajweed</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-500"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 aspect-video grid place-items-center">
                        <div className="text-center"><GraduationCap className="w-7 h-7 text-emerald-500 mx-auto" /><p className="text-[10px] mt-1 font-semibold">Teacher</p></div>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 aspect-video grid place-items-center">
                        <div className="text-center"><BookOpen className="w-7 h-7 text-primary mx-auto" /><p className="text-[10px] mt-1 font-semibold">Student</p></div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-border bg-background/60 p-3 flex items-center gap-3">
                      <Bot className="w-5 h-5 text-teal-500 shrink-0" />
                      <div className="flex-1">
                        <div className="h-1.5 w-3/4 rounded-full bg-emerald-500/40 mb-1.5" />
                        <div className="h-1.5 w-1/2 rounded-full bg-muted" />
                      </div>
                      <span className="text-[9px] font-bold text-teal-500">AI Revision</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 rounded-2xl bg-card border border-border shadow-lg px-4 py-3 hidden sm:flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-amber-400/20 text-amber-500 grid place-items-center"><Star className="w-4 h-4 fill-current" /></div>
                <div><p className="text-sm font-extrabold leading-none">4.9/5</p><p className="text-[10px] text-muted-foreground">parent rating</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ Banner 2 — Why Choose ============ */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className={sectionHeading}>Why Thousands of Students Trust Rabee Academia</h2>
            <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-2xl mx-auto">Premium one-to-one Quran education, blended with modern AI tools — built around your child&apos;s success.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="group rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/10">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white grid place-items-center mb-4 transition-transform group-hover:scale-110">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm">{f.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ Banner 3 — Courses ============ */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className={sectionHeading}>Courses We Offer</h2>
            <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-2xl mx-auto">A complete path — from your first letters to fluent recitation, memorization and understanding.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {COURSES.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.name} className="group rounded-2xl border border-border bg-card/70 backdrop-blur-sm overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/10">
                  <div className={`h-24 bg-gradient-to-br ${c.gradient} relative flex items-center px-5 overflow-hidden`}>
                    <IslamicPattern className="opacity-40 text-white" />
                    <Icon className="w-10 h-10 text-white relative" strokeWidth={1.5} />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold">{c.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 mb-4 flex-1 leading-relaxed">{c.desc}</p>
                    <a href="#register" className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-500 hover:gap-2.5 transition-all">
                      Learn More <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ Banner 4 — AI Meets Traditional ============ */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 text-teal-500 text-xs font-bold mb-4 ring-1 ring-teal-500/25">
              <Bot className="w-3.5 h-3.5" /> AI Meets Traditional Quran Learning
            </span>
            <h2 className={sectionHeading}>Smart Learning with AI Assistance</h2>
            <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-2xl mx-auto">
              Our AI supports — never replaces — qualified teachers. It keeps students revising, practicing and progressing between live lessons.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AI_FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/40">
                  <div className="w-11 h-11 rounded-xl bg-teal-500/15 text-teal-500 grid place-items-center mx-auto mb-3"><Icon className="w-5 h-5" /></div>
                  <p className="text-sm font-semibold">{f.title}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-8 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-foreground/80 leading-relaxed">
              <strong className="text-foreground">A respectful note:</strong> AI is used only as a supplementary learning tool. All Quran instruction, Tajweed correction and religious guidance are provided by qualified Quran teachers.
            </p>
          </div>
        </div>
      </section>

      {/* ============ Learning Journey ============ */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className={sectionHeading}>Your Learning Journey</h2>
            <p className="text-sm md:text-base text-muted-foreground mt-3">A clear, supported path from sign-up to certification.</p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/40 via-teal-500/40 to-emerald-500/40" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 lg:gap-3 relative">
              {JOURNEY.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.title} className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-card border-2 border-emerald-500 text-emerald-500 grid place-items-center mb-3 shadow-lg relative z-10">
                      <Icon className="w-6 h-6" />
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold grid place-items-center">{i + 1}</span>
                    </div>
                    <p className="text-xs font-semibold leading-tight">{s.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============ Student Dashboard Preview ============ */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className={sectionHeading}>Your Student Dashboard</h2>
            <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-2xl mx-auto">Everything in one place — classes, homework, AI revision, attendance and progress.</p>
          </div>
          <div className="max-w-4xl mx-auto rounded-3xl border border-border bg-card/80 backdrop-blur-sm p-5 md:p-7 shadow-2xl">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white grid place-items-center"><BookOpen className="w-4 h-4" /></div>
                <div><p className="text-sm font-bold">Assalamu Alaikum, Student</p><p className="text-[11px] text-muted-foreground">Quran Learning · Tajweed track</p></div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-500"><CalendarCheck className="w-3.5 h-3.5" /> Next class: Today 6:00 PM</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DASHBOARD.map((d) => {
                const Icon = d.icon;
                return (
                  <div key={d.label} className="rounded-xl border border-border bg-background/60 p-4 flex items-center gap-3 hover:border-emerald-500/40 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-500 grid place-items-center shrink-0"><Icon className="w-4 h-4" /></div>
                    <p className="text-xs font-semibold leading-tight">{d.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============ Meet Our Teachers ============ */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className={sectionHeading}>Meet Our Teachers</h2>
            <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-2xl mx-auto">Certified, experienced and caring — male and female tutors for every learner.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TEACHERS.map((t) => (
              <div key={t.name} className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 grid place-items-center mx-auto mb-4">
                  <GraduationCap className="w-9 h-9 text-emerald-500" />
                </div>
                <h3 className="font-bold">{t.name}</h3>
                <p className="text-xs text-emerald-500 font-semibold mt-1">{t.qual}</p>
                <div className="mt-4 space-y-1.5 text-xs text-muted-foreground text-left">
                  <p className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-emerald-500" /> Experience: <span className="text-foreground font-medium">{t.exp}</span></p>
                  <p className="flex items-center gap-2"><Languages className="w-3.5 h-3.5 text-emerald-500" /> Languages: <span className="text-foreground font-medium">{t.langs}</span></p>
                  <p className="flex items-center gap-2"><Star className="w-3.5 h-3.5 text-emerald-500" /> Specialization: <span className="text-foreground font-medium">{t.spec}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Pricing ============ */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-md">
          <div className="text-center mb-10">
            <h2 className={sectionHeading}>Simple, Honest Pricing</h2>
          </div>
          <div className="relative rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 p-[1.5px] shadow-2xl">
            <div className="rounded-[calc(1.5rem-1.5px)] bg-card/95 backdrop-blur-sm p-8 relative overflow-hidden">
              <IslamicPattern className="opacity-50" />
              <div className="relative text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-500 text-xs font-bold mb-4 ring-1 ring-emerald-500/25">Most Popular</span>
                <h3 className="text-lg font-bold">One-to-One Quran Learning</h3>
                <p className="mt-3"><span className="text-4xl font-extrabold">PKR 5,000</span><span className="text-sm text-muted-foreground"> / month</span></p>
                <ul className="mt-6 space-y-2.5 text-left">
                  {PRICING_INCLUDES.map((inc) => (
                    <li key={inc} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> {inc}
                    </li>
                  ))}
                </ul>
                <a href="#register" className="mt-7 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold hover:opacity-90 shadow-[0_0_24px_rgba(16,185,129,0.3)]">
                  Enroll Now <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ Testimonials ============ */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className={sectionHeading}>Loved by Parents & Students</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-6">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />)}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">“{t.text}”</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-500 grid place-items-center text-sm font-bold">{t.name[0]}</div>
                  <div><p className="text-sm font-bold leading-none">{t.name}</p><p className="text-[11px] text-muted-foreground mt-1">{t.role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className={sectionHeading}>Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-xl border border-border bg-card/70 backdrop-blur-sm px-5 py-4">
                <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-sm">
                  {f.q}
                  <ArrowRight className="w-4 h-4 text-emerald-500 transition-transform group-open:rotate-90 shrink-0" />
                </summary>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Registration Form ============ */}
      <section id="register" className="py-20 scroll-mt-24">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div className="text-center mb-10">
            <h2 className={sectionHeading}>Register for Quran Learning</h2>
            <p className="text-sm md:text-base text-muted-foreground mt-3">Fill in the details below and book your free assessment. It only takes a minute.</p>
          </div>
          <QuranRegisterForm />
        </div>
      </section>

      {/* ============ Final CTA Banner ============ */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 p-[1.5px] shadow-2xl max-w-5xl mx-auto">
            <div className="rounded-[calc(1.5rem-1.5px)] bg-card/95 backdrop-blur-sm p-10 md:p-14 text-center relative overflow-hidden">
              <IslamicPattern className="opacity-50" />
              <div className="relative">
                <Heart className="w-8 h-8 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">Begin Your Journey with the Holy Quran Today</h2>
                <p className="text-sm md:text-base text-muted-foreground mt-4 max-w-2xl mx-auto">
                  Learn with qualified teachers, personalized guidance and AI-powered revision tools — all from the comfort of your home.
                </p>
                <div className="flex flex-wrap justify-center gap-3 mt-8">
                  <a href="#register" className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold hover:opacity-90 shadow-[0_0_24px_rgba(16,185,129,0.3)]">
                    Enroll Now <ArrowRight className="w-4 h-4" />
                  </a>
                  <a href="tel:+923086994758" className="inline-flex items-center gap-2 px-7 py-3 rounded-xl border border-border bg-card/60 backdrop-blur-sm text-sm font-bold hover:bg-muted">
                    <Phone className="w-4 h-4" /> Contact Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
