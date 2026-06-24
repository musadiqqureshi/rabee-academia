import { Workflow, Database, Brain, Palette, Cable, type LucideIcon } from "lucide-react";

export interface StackCourse {
  slug: string;
  name: string;
  tagline: string;
  tier: "Core" | "Premium";
  price: number;           // PKR
  icon: LucideIcon;
  gradient: string;
  skills: string[];        // outcomes, not syllabus
  project: string;         // one real project
  modules: number;
}

// Rabee AI Career Stack — job-ready micro-courses. The FREE AI Mastery course is
// the entry point that funnels students into these paid skills.
export const CAREER_STACK: StackCourse[] = [
  {
    slug: "ai-automation-engineering",
    name: "AI Automation Engineering",
    tagline: "Automate real business workflows with AI.",
    tier: "Core",
    price: 500,
    icon: Workflow,
    gradient: "from-blue-600 to-indigo-600",
    skills: ["Build AI agents & automations", "Automate repetitive tasks", "Sell automation to clients"],
    project: "Build an end-to-end AI automation for a real use case",
    modules: 7,
  },
  {
    slug: "ai-data-engineering",
    name: "AI Data Engineering & Pipelines",
    tagline: "Move, clean and prepare data that powers AI.",
    tier: "Core",
    price: 500,
    icon: Database,
    gradient: "from-emerald-500 to-teal-600",
    skills: ["Build data pipelines", "Clean & structure datasets", "Feed data into AI tools"],
    project: "Build a working data pipeline from raw data to insights",
    modules: 8,
  },
  {
    slug: "ai-model-building",
    name: "AI Model Building (ML to Deployment)",
    tagline: "Machine learning basics to a deployed model.",
    tier: "Premium",
    price: 1000,
    icon: Brain,
    gradient: "from-fuchsia-600 to-purple-600",
    skills: ["Train ML models", "Evaluate & improve accuracy", "Deploy a model to production"],
    project: "Train and deploy your own ML model",
    modules: 10,
  },
  {
    slug: "ai-graphic-design",
    name: "AI Graphic Design & Creative Tools",
    tagline: "Create pro-level visuals with AI, fast.",
    tier: "Core",
    price: 500,
    icon: Palette,
    gradient: "from-pink-500 to-rose-600",
    skills: ["Design with AI tools", "Create brand & social content", "Offer creative AI services"],
    project: "Build a complete AI-designed brand kit",
    modules: 6,
  },
  {
    slug: "ai-workflow-integration",
    name: "AI Workflow & Integration Engineering",
    tagline: "Connect tools with no-code, APIs, Zapier & n8n.",
    tier: "Premium",
    price: 1000,
    icon: Cable,
    gradient: "from-orange-500 to-amber-600",
    skills: ["No-code integrations", "Connect APIs & tools", "Build automated systems (Zapier/n8n)"],
    project: "Build a multi-tool automated workflow",
    modules: 9,
  },
];

export const STACK_BUNDLE = {
  name: "AI Career Stack — All 5 Courses",
  price: 2800,
  original: CAREER_STACK.reduce((s, c) => s + c.price, 0), // 3500
};

export const ROADMAP = [
  "Free AI Mastery course",
  "AI Career Stack (paid skills)",
  "Freelancing & real projects",
  "Industry-ready for AI jobs",
];
