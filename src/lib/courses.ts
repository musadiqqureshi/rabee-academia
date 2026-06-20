import {
  Atom, FlaskConical, Calculator, Monitor, Dna,
  Telescope, Sigma, Microscope, BookOpen, Cpu, Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Course {
  slug: string;
  level: string;
  name: string;
  lessons: number;
  regularPrice: number;   // PKR per month
  weekendPrice: number;   // PKR per month
  icon: LucideIcon;
  gradient: string;
  features: string[];
  description: string;
  comingSoon?: boolean;   // shown but not yet enrollable
  free?: boolean;
  badge?: string;         // e.g. "Launching Offer · Free"
  special?: boolean;      // highlighted special-offer card
  seatLimit?: number;     // max enrolments (e.g. 30)
  duration?: string;      // e.g. "1 week"
  schedule?: string;      // e.g. "Weekends"
}

export const courses: Course[] = [
  {
    slug: "ai-mastery",
    level: "Special",
    name: "AI Mastery Course",
    lessons: 24,
    regularPrice: 0,
    weekendPrice: 0,
    icon: Sparkles,
    gradient: "from-fuchsia-600 via-purple-600 to-indigo-600",
    description: "A 1-week intensive on practical AI — tools, prompt engineering and automation for studies and work. Free launching offer, weekends only, limited to 30 seats.",
    features: ["1-week intensive (weekends)", "Hands-on AI projects", "Prompt engineering", "Certificate of completion"],
    free: true,
    special: true,
    seatLimit: 30,
    duration: "1 week",
    schedule: "Weekends",
    badge: "Free · 30 seats only",
  },
  {
    slug: "fsc-physics",
    level: "FSc Level",
    name: "FSc Physics",
    lessons: 48,
    regularPrice: 7000,
    weekendPrice: 5500,
    icon: Atom,
    gradient: "from-indigo-600 via-blue-500 to-indigo-700",
    description: "Complete FSc Physics curriculum with concept-building and exam preparation.",
    features: ["Live Google Meet classes", "AI study notes", "Past paper practice", "Doubt-clearing sessions"],
  },
  {
    slug: "fsc-chemistry",
    level: "FSc Level",
    name: "FSc Chemistry",
    lessons: 44,
    regularPrice: 7000,
    weekendPrice: 5500,
    icon: FlaskConical,
    gradient: "from-emerald-500 via-teal-400 to-emerald-600",
    description: "In-depth FSc Chemistry covering organic, inorganic, and physical chemistry.",
    features: ["Live Google Meet classes", "AI study notes", "Lab concept sessions", "Exam strategies"],
  },
  {
    slug: "fsc-biology",
    level: "FSc Level",
    name: "FSc Biology",
    lessons: 45,
    regularPrice: 7000,
    weekendPrice: 5500,
    icon: Dna,
    gradient: "from-green-500 via-lime-400 to-green-600",
    description: "FSc Biology with diagrams, practicals, and MCQ preparation.",
    features: ["Live Google Meet classes", "Diagram-based notes", "MCQ sessions", "Mock exams"],
  },
  {
    slug: "fsc-math",
    level: "FSc Level",
    name: "FSc Mathematics",
    lessons: 50,
    regularPrice: 7000,
    weekendPrice: 5500,
    icon: Sigma,
    gradient: "from-blue-600 via-sky-500 to-blue-700",
    description: "FSc Mathematics with step-by-step problem solving and practice.",
    features: ["Live Google Meet classes", "Problem-solving sessions", "Formula sheets", "Exam prep"],
  },
  {
    slug: "a-level-physics",
    level: "A Level",
    name: "A Level Physics",
    lessons: 58,
    regularPrice: 15000,
    weekendPrice: 12000,
    icon: Telescope,
    gradient: "from-rose-500 via-pink-500 to-red-600",
    description: "Cambridge A Level Physics with deep conceptual and practical understanding.",
    features: ["Cambridge curriculum aligned", "Past paper solutions", "Mock exams", "Exam technique coaching"],
  },
  {
    slug: "a-level-chemistry",
    level: "A Level",
    name: "A Level Chemistry",
    lessons: 60,
    regularPrice: 15000,
    weekendPrice: 12000,
    icon: FlaskConical,
    gradient: "from-cyan-500 via-teal-400 to-cyan-600",
    description: "A Level Chemistry with focus on CIE exam structure and paper patterns.",
    features: ["CIE exam-focused", "Theory + practical tips", "Past paper sessions", "Progress reports"],
  },
  {
    slug: "a-level-math",
    level: "A Level",
    name: "A Level Mathematics",
    lessons: 62,
    regularPrice: 15000,
    weekendPrice: 12000,
    icon: Calculator,
    gradient: "from-violet-600 via-purple-500 to-violet-700",
    description: "A Level Mathematics covering Pure, Mechanics, and Statistics.",
    features: ["Pure + Applied Math", "Past paper practice", "Exam techniques", "Weekly assessments"],
  },
  {
    slug: "o-level-math",
    level: "O Level",
    name: "O Level Mathematics",
    lessons: 52,
    regularPrice: 15000,
    weekendPrice: 12000,
    icon: Calculator,
    gradient: "from-orange-500 via-amber-400 to-orange-600",
    description: "O Level Mathematics with full IGCSE coverage and exam readiness.",
    features: ["IGCSE aligned", "Past paper practice", "Calculator + non-calc prep", "Mock exams"],
  },
  {
    slug: "o-level-physics",
    level: "O Level",
    name: "O Level Physics",
    lessons: 50,
    regularPrice: 15000,
    weekendPrice: 12000,
    icon: Atom,
    gradient: "from-sky-500 via-blue-400 to-sky-600",
    description: "O Level Physics with experiments, theory, and structured revision.",
    features: ["IGCSE aligned", "Experimental concepts", "Paper 2 + 4 prep", "Exam technique"],
  },
  {
    slug: "bs-cs",
    level: "BS Level",
    name: "BS Computer Science",
    lessons: 70,
    regularPrice: 10000,
    weekendPrice: 8000,
    icon: Monitor,
    gradient: "from-purple-600 via-violet-500 to-purple-700",
    description: "BS CS covering data structures, algorithms, databases, and software engineering.",
    features: ["Project-based learning", "Code reviews", "Industry best practices", "1-on-1 mentoring"],
  },
  {
    slug: "bs-physics",
    level: "BS Level",
    name: "BS Physics",
    lessons: 65,
    regularPrice: 10000,
    weekendPrice: 8000,
    icon: Telescope,
    gradient: "from-indigo-500 via-blue-400 to-indigo-600",
    description: "BS Physics with mathematical foundations, quantum, and classical mechanics.",
    features: ["Research-oriented", "Advanced problem solving", "Lab simulations", "Project guidance"],
  },
  {
    slug: "bs-math",
    level: "BS Level",
    name: "BS Mathematics",
    lessons: 65,
    regularPrice: 10000,
    weekendPrice: 8000,
    icon: Sigma,
    gradient: "from-teal-500 via-cyan-400 to-teal-600",
    description: "BS Mathematics with real analysis, algebra, and applied mathematics.",
    features: ["Proof-based learning", "Research guidance", "Weekly assessments", "1-on-1 sessions"],
  },
  {
    slug: "ms-cs",
    level: "MS Level",
    name: "MS Computer Science",
    lessons: 80,
    regularPrice: 18000,
    weekendPrice: 15000,
    icon: Cpu,
    gradient: "from-slate-600 via-gray-500 to-slate-700",
    description: "MS CS with AI, ML, distributed systems, and thesis support.",
    features: ["Research supervision", "Thesis guidance", "Flexible scheduling", "Expert consultation"],
  },
  {
    slug: "ms-physics",
    level: "MS Level",
    name: "MS Physics",
    lessons: 75,
    regularPrice: 18000,
    weekendPrice: 15000,
    icon: Microscope,
    gradient: "from-rose-600 via-red-500 to-rose-700",
    description: "MS Physics covering advanced quantum mechanics, condensed matter, and research methods.",
    features: ["Research oriented", "Specialized topics", "Thesis support", "Expert faculty"],
  },
  {
    slug: "ms-math",
    level: "MS Level",
    name: "MS Mathematics",
    lessons: 75,
    regularPrice: 18000,
    weekendPrice: 15000,
    icon: BookOpen,
    gradient: "from-amber-600 via-yellow-500 to-amber-700",
    description: "MS Mathematics with topology, functional analysis, and research guidance.",
    features: ["Advanced topics", "Research guidance", "Thesis support", "Flexible schedule"],
  },
];

export const LEVELS = ["All", "FSc Level", "A Level", "O Level", "BS Level", "MS Level"] as const;

export function getCourse(slug: string) {
  return courses.find((c) => c.slug === slug) ?? null;
}

export function formatPrice(pkr: number) {
  return `PKR ${pkr.toLocaleString("en-PK")}`;
}
