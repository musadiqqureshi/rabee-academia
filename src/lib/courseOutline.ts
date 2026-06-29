import type { Course } from "@/lib/courses";

// Generates a detailed, subject-aware course outline from the data we already
// have on a Course (name, level, description, features, lessons). Used by the
// /courses/<slug> detail pages so every catalog subject — including admin-added
// DB subjects — gets a proper "Learn More" page without hand-written syllabi.

export interface CourseOutline {
  intro: string;
  whoFor: string;
  modules: string[];
  outcomes: string[];
  highlights: string[];
}

type Family = "physics" | "chemistry" | "biology" | "math" | "cs" | "generic";

function detectFamily(name: string): Family {
  const n = name.toLowerCase();
  if (n.includes("physics")) return "physics";
  if (n.includes("chemistry")) return "chemistry";
  if (n.includes("biology")) return "biology";
  if (n.includes("math")) return "math";
  if (n.includes("computer") || n.includes(" cs")) return "cs";
  return "generic";
}

const FAMILY_MODULES: Record<Exclude<Family, "generic">, string[]> = {
  physics: [
    "Mechanics — motion, forces & energy",
    "Waves, sound & optics",
    "Thermodynamics & heat",
    "Electricity, magnetism & circuits",
    "Modern & nuclear physics",
    "Numericals & problem-solving drills",
    "Past papers & exam technique",
  ],
  chemistry: [
    "Atomic structure & the periodic table",
    "Chemical bonding & states of matter",
    "Stoichiometry & the mole concept",
    "Physical chemistry — energetics & equilibrium",
    "Organic chemistry foundations & reactions",
    "Inorganic chemistry & qualitative analysis",
    "Past papers & exam technique",
  ],
  biology: [
    "Cell biology & biomolecules",
    "Bioenergetics — enzymes, respiration & photosynthesis",
    "Human physiology & systems",
    "Genetics, inheritance & evolution",
    "Ecology & the environment",
    "Diagrams, practicals & MCQ practice",
    "Past papers & exam technique",
  ],
  math: [
    "Algebra & functions",
    "Trigonometry & coordinate geometry",
    "Calculus — differentiation & integration",
    "Vectors, matrices & complex numbers",
    "Probability & statistics",
    "Step-by-step problem-solving practice",
    "Past papers & exam technique",
  ],
  cs: [
    "Programming fundamentals & logic",
    "Data representation & computer systems",
    "Algorithms & problem solving",
    "Databases & data management",
    "Networks, the web & security basics",
    "Hands-on coding projects",
    "Past papers & exam technique",
  ],
};

function levelAudience(level: string): string {
  const l = level.toLowerCase();
  if (l.includes("fsc")) return "FSc Pre-Medical & Pre-Engineering students preparing for board exams.";
  if (l.includes("a level") || l.includes("a/o") || l.includes("o level"))
    return "Cambridge / IGCSE O & A Level students aiming for top grades.";
  if (l.includes("bs")) return "University BS students building strong academic and practical foundations.";
  if (l.includes("ms")) return "MS students and researchers seeking advanced, supervised study.";
  if (l.includes("special")) return "Anyone keen to learn — no prior experience required.";
  return "Students who want structured, expert-led learning in this subject.";
}

export function buildOutline(course: Course): CourseOutline {
  const fam = detectFamily(course.name);

  // Generic fallback (admin-added subjects we can't map): build an arc from the
  // subject's own marketing features so the page still feels complete.
  const genericModules = [
    `Foundations of ${course.name}`,
    "Core concepts, step by step",
    ...course.features.slice(0, 3),
    "Guided practice & assignments",
    "Revision & exam technique",
  ];

  const modules = fam === "generic" ? genericModules : FAMILY_MODULES[fam];

  const intro =
    `${course.description} ` +
    `Delivered as live one-to-one classes over Google Meet with your own teacher, ` +
    `personalized pace, weekly practice and AI-powered study support — ${course.lessons} lessons in total.`;

  const outcomes = [
    `Master the core concepts of ${course.name} with clarity`,
    `Solve problems and exam questions with confidence`,
    `Apply effective ${course.level} exam techniques`,
    `Track steady progress with regular assessments`,
  ];

  return {
    intro,
    whoFor: levelAudience(course.level),
    modules,
    outcomes,
    highlights: course.features,
  };
}
