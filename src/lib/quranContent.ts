// Bilingual (English / Urdu) content for the Quran Learning pages.
// Single source of truth so the landing page and course detail pages stay in
// sync across both languages. Urdu wording can be refined here any time.

export type Lang = "en" | "ur";
export type Bi = { en: string; ur: string };
export type BiList = { en: string[]; ur: string[] };

export const PRICE_ACTUAL = 11000;
export const PRICE_LAUNCH = 5000;

// ---------------------------------------------------------------------------
// Landing page strings — two parallel objects, consumed as LANDING[lang].
// ---------------------------------------------------------------------------
export const LANDING = {
  en: {
    langName: "اردو",
    badgeNew: "New at Rabee Academia",
    heroSlides: [
      {
        title: "Learn the Holy Quran with Expert Teachers & AI-Powered Learning",
        subtitle:
          "Personalized one-to-one online Quran classes for children and adults — Noorani Qaida, Nazra, Tajweed, Hifz support and Islamic Studies with certified teachers, enhanced by AI-powered revision tools.",
      },
      {
        title: "Certified Male & Female Quran Teachers, One-to-One",
        subtitle:
          "Every class is private and focused, with teachers chosen for your family's comfort. Flexible timings for every time zone, anywhere in the world.",
      },
      {
        title: "Traditional Teaching, Smart AI Revision",
        subtitle:
          "Keep progressing between live lessons with AI-powered daily revision, quizzes and pronunciation practice — guided by qualified teachers, never replaced by AI.",
      },
    ],
    ctaEnroll: "Enroll Now",
    ctaAssess: "Book Free Assessment",
    trust: ["Certified teachers", "Male & female tutors", "Students worldwide"],
    marquee: [
      "Noorani Qaida", "Nazra Quran", "Tajweed", "Hifz Support", "Islamic Studies",
      "Quran Translation", "One-to-One Classes", "Certified Teachers", "AI Revision", "Free Assessment",
    ],
    whyHeading: "Why Thousands of Students Trust Rabee Academia",
    whySub: "Premium one-to-one Quran education, blended with modern AI tools — built around your child's success.",
    why: [
      { title: "One-to-One Live Classes", desc: "Undivided attention in every private session." },
      { title: "Certified Male & Female Teachers", desc: "Qualified, vetted Quran tutors for every family." },
      { title: "Flexible Class Timings", desc: "Pick slots that fit your timezone and routine." },
      { title: "Weekly Homework", desc: "Structured practice that builds steady progress." },
      { title: "Monthly Progress Reports", desc: "Clear feedback parents can actually track." },
      { title: "AI Revision Assistant", desc: "Smart revision between live lessons, anytime." },
      { title: "Personalized Learning Plans", desc: "A roadmap shaped around each student's goals." },
      { title: "International Students Welcome", desc: "Trusted by families across the globe." },
    ],
    coursesHeading: "Courses We Offer",
    coursesSub: "A complete path — from your first letters to fluent recitation, memorization and understanding.",
    learnMore: "Learn More",
    aiBadge: "AI Meets Traditional Quran Learning",
    aiHeading: "Smart Learning with AI Assistance",
    aiSub: "Our AI supports — never replaces — qualified teachers. It keeps students revising, practicing and progressing between live lessons.",
    aiFeatures: [
      "Daily Revision", "Practice Quizzes", "Lesson Summaries", "Personalized Study Plans",
      "Learning Progress Tracking", "Pronunciation Practice Guidance", "24/7 Revision Support",
    ],
    aiNoteLead: "A respectful note:",
    aiNote: "AI is used only as a supplementary learning tool. All Quran instruction, Tajweed correction and religious guidance are provided by qualified Quran teachers.",
    journeyHeading: "Your Learning Journey",
    journeySub: "A clear, supported path from sign-up to certification.",
    journey: [
      "Register Online", "Free Assessment", "Teacher Assignment", "Schedule Classes",
      "Live One-to-One Learning", "Homework & Assignments", "Monthly Evaluation", "Certificate of Completion",
    ],
    dashHeading: "Your Student Dashboard",
    dashSub: "Everything in one place — classes, homework, AI revision, attendance and progress.",
    dashGreeting: "Assalamu Alaikum, Student",
    dashTrack: "Quran Learning · Tajweed track",
    dashNext: "Next class: Today 6:00 PM",
    dash: [
      "Upcoming Classes", "Join Live Session", "Homework", "Assignment Submission", "AI Revision",
      "Attendance", "Progress Reports", "Teacher Feedback", "Certificates",
    ],
    teachersHeading: "Meet Our Teachers",
    teachersSub: "Certified, experienced and caring — male and female tutors for every learner.",
    labelExp: "Experience",
    labelLangs: "Languages",
    labelSpec: "Specialization",
    pricingHeading: "Simple, Honest Pricing",
    pricingPlan: "One-to-One Quran Learning",
    perMonth: "/ month",
    wasLabel: "was",
    launchLabel: "Launch offer",
    includesTitle: "Most Popular",
    includes: [
      "Live One-to-One Sessions", "Certified Quran Teacher", "Weekly Homework",
      "AI Revision Assistant", "Monthly Assessment", "Flexible Scheduling", "Progress Reports",
    ],
    testimonialsHeading: "Loved by Parents & Students",
    testimonials: [
      { text: "My daughter went from struggling with Qaida to reading fluently in months. The female teacher made her so comfortable.", name: "Sara A.", role: "Parent · UK" },
      { text: "The Tajweed correction is excellent and the AI revision keeps me practicing between classes. Highly recommend.", name: "Imran H.", role: "Student · Canada" },
      { text: "One-to-one attention and the monthly reports keep me fully updated on my son's progress. Worth every rupee.", name: "Fatima Z.", role: "Parent · USA" },
    ],
    faqHeading: "Frequently Asked Questions",
    faq: [
      { q: "Who can join?", a: "Anyone — children and adults, beginners to advanced. We tailor each plan to the student's current level and goals." },
      { q: "Are classes one-to-one?", a: "Yes. Every class is a private, one-to-one live session with your assigned teacher for focused attention." },
      { q: "What age groups are accepted?", a: "We welcome students of all ages, from young children (around 4+) to adults. Lessons are made age-appropriate." },
      { q: "Are female teachers available?", a: "Yes. We have certified female Quran teachers, so sisters and young girls can learn comfortably." },
      { q: "How are classes conducted?", a: "Classes run online via video call (e.g. Google Meet / Zoom) with screen sharing and digital Quran tools." },
      { q: "What is the monthly fee?", a: "One-to-one Quran learning is PKR 11,000/month — currently PKR 5,000/month as a launch offer, including AI revision tools, homework and monthly assessments." },
      { q: "What devices are required?", a: "Any laptop, tablet or smartphone with a stable internet connection, a microphone and a camera." },
      { q: "Is there a free assessment?", a: "Yes. Register and we'll arrange a free assessment to gauge your level before assigning the right teacher and plan." },
    ],
    registerHeading: "Register for Quran Learning",
    registerSub: "Fill in the details below and book your free assessment. It only takes a minute.",
    finalHeading: "Begin Your Journey with the Holy Quran Today",
    finalSub: "Learn with qualified teachers, personalized guidance and AI-powered revision tools — all from the comfort of your home.",
    contactUs: "Contact Us",
    ai: {
      title: "Rabee's AI",
      subtitle: "Ask about Quran courses & fees",
      launcher: "Ask Rabee's AI",
      placeholder: "Ask about Quran classes…",
      typing: "Typing…",
      greeting: "Assalamu Alaikum 👋 I'm Rabee's AI. Ask me about our Quran courses, the PKR 5,000 launch offer, female teachers, or how to book a free assessment.",
      suggestions: ["Which Quran courses do you offer?", "What is the monthly fee?", "Are female teachers available?", "How do I book a free assessment?"],
    },
  },
  ur: {
    langName: "English",
    badgeNew: "ربیع اکیڈمیا میں نیا",
    heroSlides: [
      {
        title: "ماہر اساتذہ اور اے آئی سے قرآن مجید سیکھیں",
        subtitle:
          "بچوں اور بڑوں کے لیے ذاتی، ون ٹو ون آن لائن قرآن کلاسز — نورانی قاعدہ، ناظرہ، تجوید، حفظ اور اسلامیات، مستند اساتذہ کے ساتھ اور اے آئی ریوژن ٹولز کے ہمراہ۔",
      },
      {
        title: "مستند مرد و خواتین قرآن اساتذہ، ون ٹو ون",
        subtitle:
          "ہر کلاس نجی اور توجہ مرکوز ہوتی ہے، اساتذہ آپ کے گھرانے کی سہولت کے مطابق منتخب کیے جاتے ہیں۔ ہر ٹائم زون کے لیے لچکدار اوقات، دنیا میں کہیں بھی۔",
      },
      {
        title: "روایتی تعلیم، ذہین اے آئی ریوژن",
        subtitle:
          "لائیو اسباق کے درمیان اے آئی روزانہ ریوژن، کوئز اور تلفظ کی مشق سے آگے بڑھتے رہیں — مستند اساتذہ کی رہنمائی میں، اے آئی کبھی اساتذہ کا متبادل نہیں۔",
      },
    ],
    ctaEnroll: "ابھی داخلہ لیں",
    ctaAssess: "مفت جائزہ بُک کریں",
    trust: ["مستند اساتذہ", "مرد و خواتین اساتذہ", "دنیا بھر کے طلبہ"],
    marquee: [
      "نورانی قاعدہ", "ناظرہ قرآن", "تجوید", "حفظ", "اسلامیات",
      "قرآن ترجمہ", "ون ٹو ون کلاسز", "مستند اساتذہ", "اے آئی ریوژن", "مفت جائزہ",
    ],
    whyHeading: "ہزاروں طلبہ ربیع اکیڈمیا پر کیوں اعتماد کرتے ہیں",
    whySub: "اعلیٰ معیار کی ون ٹو ون قرآن تعلیم، جدید اے آئی ٹولز کے ساتھ — آپ کے بچے کی کامیابی کے گرد ترتیب دی گئی۔",
    why: [
      { title: "ون ٹو ون لائیو کلاسز", desc: "ہر نجی سیشن میں مکمل توجہ۔" },
      { title: "مستند مرد و خواتین اساتذہ", desc: "ہر گھرانے کے لیے تجربہ کار، جانچے ہوئے اساتذہ۔" },
      { title: "لچکدار کلاس اوقات", desc: "اپنے ٹائم زون اور معمول کے مطابق وقت چنیں۔" },
      { title: "ہفتہ وار ہوم ورک", desc: "مستقل ترقی کے لیے منظم مشق۔" },
      { title: "ماہانہ کارکردگی رپورٹ", desc: "والدین کے لیے واضح اور قابلِ پیمائش فیڈبیک۔" },
      { title: "اے آئی ریوژن اسسٹنٹ", desc: "لائیو اسباق کے درمیان ذہین ریوژن، کسی بھی وقت۔" },
      { title: "ذاتی نوعیت کے سیکھنے کے پلان", desc: "ہر طالب علم کے اہداف کے مطابق روڈ میپ۔" },
      { title: "بین الاقوامی طلبہ خوش آمدید", desc: "دنیا بھر کے گھرانوں کا اعتماد۔" },
    ],
    coursesHeading: "ہمارے کورسز",
    coursesSub: "مکمل راستہ — پہلے حروف سے روانی سے تلاوت، حفظ اور سمجھ تک۔",
    learnMore: "مزید جانیں",
    aiBadge: "روایتی قرآن تعلیم کے ساتھ اے آئی",
    aiHeading: "اے آئی کی مدد سے ذہین تعلیم",
    aiSub: "ہمارا اے آئی مستند اساتذہ کی مدد کرتا ہے — متبادل نہیں۔ یہ طلبہ کو لائیو اسباق کے درمیان ریوژن، مشق اور ترقی میں مصروف رکھتا ہے۔",
    aiFeatures: [
      "روزانہ ریوژن", "مشقی کوئز", "اسباق کا خلاصہ", "ذاتی مطالعہ پلان",
      "سیکھنے کی پیش رفت کی نگرانی", "تلفظ کی مشق کی رہنمائی", "چوبیس گھنٹے ریوژن سپورٹ",
    ],
    aiNoteLead: "ایک ادب بھرا نوٹ:",
    aiNote: "اے آئی صرف ایک معاون ذریعہ کے طور پر استعمال ہوتا ہے۔ قرآن کی تمام تعلیم، تجوید کی درستی اور دینی رہنمائی مستند قرآن اساتذہ فراہم کرتے ہیں۔",
    journeyHeading: "آپ کا تعلیمی سفر",
    journeySub: "رجسٹریشن سے سند تک واضح اور مکمل معاون راستہ۔",
    journey: [
      "آن لائن رجسٹریشن", "مفت جائزہ", "استاد کی تفویض", "کلاسز کا شیڈول",
      "لائیو ون ٹو ون تعلیم", "ہوم ورک اور اسائنمنٹس", "ماہانہ جائزہ", "سند برائے تکمیل",
    ],
    dashHeading: "آپ کا اسٹوڈنٹ ڈیش بورڈ",
    dashSub: "سب کچھ ایک جگہ — کلاسز، ہوم ورک، اے آئی ریوژن، حاضری اور پیش رفت۔",
    dashGreeting: "السلام علیکم، طالب علم",
    dashTrack: "قرآن لرننگ · تجوید ٹریک",
    dashNext: "اگلی کلاس: آج شام 6:00 بجے",
    dash: [
      "آئندہ کلاسز", "لائیو سیشن میں شامل ہوں", "ہوم ورک", "اسائنمنٹ جمع کرائیں", "اے آئی ریوژن",
      "حاضری", "پیش رفت رپورٹس", "استاد کا فیڈبیک", "اسناد",
    ],
    teachersHeading: "ہمارے اساتذہ سے ملیں",
    teachersSub: "مستند، تجربہ کار اور مہربان — ہر طالب علم کے لیے مرد و خواتین اساتذہ۔",
    labelExp: "تجربہ",
    labelLangs: "زبانیں",
    labelSpec: "خصوصیت",
    pricingHeading: "سادہ اور شفاف قیمت",
    pricingPlan: "ون ٹو ون قرآن لرننگ",
    perMonth: "/ ماہانہ",
    wasLabel: "پہلے",
    launchLabel: "افتتاحی پیشکش",
    includesTitle: "سب سے مقبول",
    includes: [
      "لائیو ون ٹو ون سیشنز", "مستند قرآن استاد", "ہفتہ وار ہوم ورک",
      "اے آئی ریوژن اسسٹنٹ", "ماہانہ جائزہ", "لچکدار شیڈولنگ", "پیش رفت رپورٹس",
    ],
    testimonialsHeading: "والدین اور طلبہ کی پسند",
    testimonials: [
      { text: "میری بیٹی قاعدہ میں مشکل سے چند ماہ میں روانی سے پڑھنے لگی۔ خاتون استاد نے اسے بہت سہولت دی۔", name: "ثناء اے۔", role: "والدہ · برطانیہ" },
      { text: "تجوید کی درستی بہترین ہے اور اے آئی ریوژن مجھے کلاسز کے درمیان مشق میں مصروف رکھتا ہے۔ بہت سفارش کرتا ہوں۔", name: "عمران ایچ۔", role: "طالب علم · کینیڈا" },
      { text: "ون ٹو ون توجہ اور ماہانہ رپورٹس میرے بیٹے کی پیش رفت سے مکمل آگاہ رکھتی ہیں۔ ہر روپے کے قابل۔", name: "فاطمہ زیڈ۔", role: "والدہ · امریکہ" },
    ],
    faqHeading: "اکثر پوچھے جانے والے سوالات",
    faq: [
      { q: "کون شامل ہو سکتا ہے؟", a: "ہر کوئی — بچے اور بڑے، مبتدی سے ماہر تک۔ ہم ہر پلان کو طالب علم کی موجودہ سطح اور اہداف کے مطابق ترتیب دیتے ہیں۔" },
      { q: "کیا کلاسز ون ٹو ون ہیں؟", a: "جی ہاں۔ ہر کلاس آپ کے مقرر کردہ استاد کے ساتھ ایک نجی، ون ٹو ون لائیو سیشن ہے۔" },
      { q: "کن عمروں کے طلبہ قبول ہیں؟", a: "ہم ہر عمر کے طلبہ کا خیرمقدم کرتے ہیں، چھوٹے بچوں (تقریباً 4 سال) سے بڑوں تک۔ اسباق عمر کے مطابق ہوتے ہیں۔" },
      { q: "کیا خواتین اساتذہ دستیاب ہیں؟", a: "جی ہاں۔ ہمارے پاس مستند خواتین قرآن اساتذہ ہیں تاکہ بہنیں اور بچیاں سہولت سے سیکھ سکیں۔" },
      { q: "کلاسز کیسے ہوتی ہیں؟", a: "کلاسز آن لائن ویڈیو کال (مثلاً گوگل میٹ / زوم) کے ذریعے اسکرین شیئرنگ اور ڈیجیٹل قرآن ٹولز کے ساتھ ہوتی ہیں۔" },
      { q: "ماہانہ فیس کتنی ہے؟", a: "ون ٹو ون قرآن لرننگ 11,000 روپے ماہانہ ہے — افتتاحی پیشکش کے تحت فی الحال 5,000 روپے ماہانہ، اے آئی ریوژن ٹولز، ہوم ورک اور ماہانہ جائزے کے ساتھ۔" },
      { q: "کن آلات کی ضرورت ہے؟", a: "کوئی بھی لیپ ٹاپ، ٹیبلٹ یا اسمارٹ فون مستحکم انٹرنیٹ، مائیکروفون اور کیمرے کے ساتھ۔" },
      { q: "کیا مفت جائزہ ہے؟", a: "جی ہاں۔ رجسٹر کریں اور ہم درست استاد اور پلان تفویض کرنے سے پہلے آپ کی سطح جانچنے کے لیے مفت جائزہ ترتیب دیں گے۔" },
    ],
    registerHeading: "قرآن لرننگ کے لیے رجسٹر کریں",
    registerSub: "نیچے تفصیلات بھریں اور اپنا مفت جائزہ بُک کریں۔ صرف ایک منٹ لگے گا۔",
    finalHeading: "آج ہی قرآن مجید کے ساتھ اپنا سفر شروع کریں",
    finalSub: "مستند اساتذہ، ذاتی رہنمائی اور اے آئی ریوژن ٹولز کے ساتھ سیکھیں — اپنے گھر کے آرام سے۔",
    contactUs: "رابطہ کریں",
    ai: {
      title: "ربیع اے آئی",
      subtitle: "قرآن کورسز اور فیس کے بارے میں پوچھیں",
      launcher: "ربیع اے آئی سے پوچھیں",
      placeholder: "قرآن کلاسز کے بارے میں پوچھیں…",
      typing: "لکھ رہے ہیں…",
      greeting: "السلام علیکم 👋 میں ربیع اے آئی ہوں۔ ہمارے قرآن کورسز، 5,000 روپے افتتاحی پیشکش، خواتین اساتذہ، یا مفت جائزہ بُک کرنے کے بارے میں پوچھیں۔",
      suggestions: ["آپ کون سے قرآن کورسز پیش کرتے ہیں؟", "ماہانہ فیس کتنی ہے؟", "کیا خواتین اساتذہ دستیاب ہیں؟", "مفت جائزہ کیسے بُک کروں؟"],
    },
  },
} as const;

// ---------------------------------------------------------------------------
// Teachers (names stay as-is; roles/specialities are translated inline).
// ---------------------------------------------------------------------------
export const QURAN_TEACHERS: { name: string; qual: Bi; exp: Bi; langs: Bi; spec: Bi }[] = [
  {
    name: "Qari Abdullah",
    qual: { en: "Hafiz-e-Quran · Tajweed Certified", ur: "حافظِ قرآن · مستند تجوید" },
    exp: { en: "8+ years", ur: "8+ سال" },
    langs: { en: "Arabic, Urdu, English", ur: "عربی، اردو، انگریزی" },
    spec: { en: "Tajweed & Hifz", ur: "تجوید و حفظ" },
  },
  {
    name: "Ustadha Maryam",
    qual: { en: "Alimah · Quran & Islamic Studies", ur: "عالمہ · قرآن و اسلامیات" },
    exp: { en: "6+ years", ur: "6+ سال" },
    langs: { en: "Urdu, English", ur: "اردو، انگریزی" },
    spec: { en: "Kids & Noorani Qaida", ur: "بچے و نورانی قاعدہ" },
  },
  {
    name: "Qari Bilal",
    qual: { en: "Hafiz-e-Quran · Ijazah in Recitation", ur: "حافظِ قرآن · سندِ قراءت" },
    exp: { en: "10+ years", ur: "10+ سال" },
    langs: { en: "Arabic, English", ur: "عربی، انگریزی" },
    spec: { en: "Nazra & Tajweed", ur: "ناظرہ و تجوید" },
  },
];

// ---------------------------------------------------------------------------
// Course outlines — keyed by the same slugs as src/lib/courses.ts.
// ---------------------------------------------------------------------------
export interface QuranCourse {
  slug: string;
  gradient: string;
  name: Bi;
  tagline: Bi;
  intro: Bi;
  whoFor: Bi;
  modules: BiList;
  outcomes: BiList;
}

export const QURAN_COURSES: QuranCourse[] = [
  {
    slug: "quran-noorani-qaida",
    gradient: "from-emerald-500 to-teal-600",
    name: { en: "Noorani Qaida", ur: "نورانی قاعدہ" },
    tagline: { en: "Build a strong foundation for Quran reading.", ur: "قرآن پڑھنے کی مضبوط بنیاد بنائیں۔" },
    intro: {
      en: "The Noorani Qaida is the first step to reading the Quran. Students learn the Arabic letters, their correct pronunciation points (makharij), joining letters, vowels and the rules needed to read confidently — one-to-one with a certified teacher.",
      ur: "نورانی قاعدہ قرآن پڑھنے کا پہلا قدم ہے۔ طلبہ عربی حروف، ان کے درست مخارج، حروف کو ملانا، حرکات اور با اعتماد پڑھنے کے لیے ضروری قواعد ایک مستند استاد کے ساتھ ون ٹو ون سیکھتے ہیں۔",
    },
    whoFor: { en: "Complete beginners — children and adults starting from zero.", ur: "بالکل مبتدی — صفر سے شروع کرنے والے بچے اور بڑے۔" },
    modules: {
      en: [
        "Arabic alphabet & letter recognition",
        "Makharij — correct points of articulation",
        "Joining letters (huroof murakkabat)",
        "Vowels: Fatha, Kasra, Damma & Tanween",
        "Sukoon, Shadda & elongation (madd)",
        "Reading practice with simple words",
      ],
      ur: [
        "عربی حروفِ تہجی اور حروف کی شناخت",
        "مخارج — حروف کے درست مقامات",
        "حروف کو ملانا (حروفِ مرکبات)",
        "حرکات: زبر، زیر، پیش اور تنوین",
        "سکون، شد اور مد",
        "آسان الفاظ سے پڑھنے کی مشق",
      ],
    },
    outcomes: {
      en: ["Read Arabic letters & words correctly", "Apply basic Tajweed of letters", "Move confidently to Nazra Quran"],
      ur: ["عربی حروف و الفاظ درست پڑھیں", "حروف کی بنیادی تجوید لگائیں", "اعتماد سے ناظرہ کی طرف بڑھیں"],
    },
  },
  {
    slug: "quran-nazra",
    gradient: "from-teal-500 to-cyan-600",
    name: { en: "Nazra Quran", ur: "ناظرہ قرآن" },
    tagline: { en: "Learn fluent Quran recitation.", ur: "روانی سے قرآن کی تلاوت سیکھیں۔" },
    intro: {
      en: "Nazra is reading the Quran fluently while looking at the text. Building on the Qaida, students practice reading verses with correct flow, basic Tajweed and rhythm, progressing through the Quran with their teacher.",
      ur: "ناظرہ سے مراد متن دیکھ کر روانی سے قرآن پڑھنا ہے۔ قاعدہ کی بنیاد پر طلبہ درست روانی، بنیادی تجوید اور لَے کے ساتھ آیات پڑھنے کی مشق کرتے ہیں اور استاد کے ساتھ قرآن میں آگے بڑھتے ہیں۔",
    },
    whoFor: { en: "Students who have completed the Qaida or can read basic Arabic.", ur: "وہ طلبہ جنہوں نے قاعدہ مکمل کر لیا یا بنیادی عربی پڑھ لیتے ہیں۔" },
    modules: {
      en: [
        "Fluency drills with short Surahs",
        "Word-by-word reading accuracy",
        "Applying letter & vowel rules in flow",
        "Stopping & starting (waqf) basics",
        "Pace, rhythm and breath control",
        "Progressive reading through the Quran",
      ],
      ur: [
        "چھوٹی سورتوں سے روانی کی مشق",
        "لفظ بہ لفظ درست پڑھائی",
        "روانی میں حروف و حرکات کے قواعد کا اطلاق",
        "وقف و ابتدا کی بنیادی باتیں",
        "رفتار، لَے اور سانس کا توازن",
        "بتدریج پورے قرآن کی پڑھائی",
      ],
    },
    outcomes: {
      en: ["Recite the Quran fluently from the text", "Maintain correct flow & stops", "Ready for focused Tajweed"],
      ur: ["متن سے روانی سے تلاوت کریں", "درست روانی و وقف برقرار رکھیں", "تجوید کے لیے تیار ہوں"],
    },
  },
  {
    slug: "quran-tajweed",
    gradient: "from-green-500 to-emerald-600",
    name: { en: "Tajweed", ur: "تجوید" },
    tagline: { en: "Master pronunciation and articulation.", ur: "تلفظ اور ادائیگی میں مہارت حاصل کریں۔" },
    intro: {
      en: "Tajweed is the science of reciting the Quran exactly as it was revealed. Students learn the detailed rules of pronunciation, characteristics of letters, nasalization, elongation and the etiquette of beautiful recitation, with live correction from a certified teacher.",
      ur: "تجوید قرآن کو ویسے ہی پڑھنے کا علم ہے جیسے نازل ہوا۔ طلبہ تلفظ کے تفصیلی قواعد، حروف کی صفات، غنہ، مد اور خوبصورت تلاوت کے آداب سیکھتے ہیں، مستند استاد کی لائیو اصلاح کے ساتھ۔",
    },
    whoFor: { en: "Fluent Nazra readers wanting precise, beautiful recitation.", ur: "روانی سے ناظرہ پڑھنے والے جو درست و خوبصورت تلاوت چاہتے ہیں۔" },
    modules: {
      en: [
        "Makharij & sifaat (letter characteristics)",
        "Rules of Noon Sakin & Tanween",
        "Rules of Meem Sakin",
        "Madd (elongation) types & lengths",
        "Qalqalah, Ghunnah & Idghaam",
        "Waqf rules & recitation etiquette",
      ],
      ur: [
        "مخارج و صفاتِ حروف",
        "نون ساکن و تنوین کے قواعد",
        "میم ساکن کے قواعد",
        "مد کی اقسام و مقدار",
        "قلقلہ، غنہ و ادغام",
        "وقف کے قواعد و آدابِ تلاوت",
      ],
    },
    outcomes: {
      en: ["Recite with full Tajweed rules", "Self-correct pronunciation", "Recite beautifully and accurately"],
      ur: ["مکمل تجوید کے ساتھ تلاوت کریں", "اپنے تلفظ کی خود اصلاح کریں", "خوبصورت و درست تلاوت کریں"],
    },
  },
  {
    slug: "quran-hifz",
    gradient: "from-cyan-500 to-blue-600",
    name: { en: "Hifz Support", ur: "حفظ سپورٹ" },
    tagline: { en: "Structured memorization with revision plans.", ur: "منظم حفظ اور ریوژن پلان کے ساتھ۔" },
    intro: {
      en: "A supported memorization program with a Hafiz teacher. Students memorize new portions (sabaq), revise recent ones (sabqi) and consolidate older ones (manzil) on a smart, spaced schedule — with AI-assisted revision to keep memory strong.",
      ur: "حافظ استاد کے ساتھ معاون حفظ پروگرام۔ طلبہ نیا سبق یاد کرتے ہیں، حالیہ سبقی دہراتے ہیں اور پرانا منزل پختہ کرتے ہیں، ایک ذہین، وقفہ دار شیڈول پر — یادداشت مضبوط رکھنے کے لیے اے آئی ریوژن کے ساتھ۔",
    },
    whoFor: { en: "Students with good Tajweed aiming to memorize the Quran.", ur: "اچھی تجوید والے طلبہ جو قرآن حفظ کرنا چاہتے ہیں۔" },
    modules: {
      en: [
        "Personalized memorization targets",
        "Sabaq — new memorization technique",
        "Sabqi — recent revision",
        "Manzil — long-term consolidation",
        "Spaced-repetition revision plan",
        "Tajweed accuracy during Hifz",
      ],
      ur: [
        "ذاتی حفظ اہداف",
        "سبق — نئے حفظ کی تکنیک",
        "سبقی — حالیہ دہرائی",
        "منزل — طویل مدتی پختگی",
        "وقفہ دار دہرائی کا پلان",
        "حفظ کے دوران تجوید کی درستی",
      ],
    },
    outcomes: {
      en: ["Memorize with a proven system", "Retain through structured revision", "Track Hifz progress monthly"],
      ur: ["آزمودہ نظام سے حفظ کریں", "منظم دہرائی سے یاد رکھیں", "ماہانہ حفظ پیش رفت دیکھیں"],
    },
  },
  {
    slug: "quran-islamic-studies",
    gradient: "from-amber-500 to-orange-600",
    name: { en: "Islamic Studies", ur: "اسلامیات" },
    tagline: { en: "Duas, Salah, manners and basic Aqeedah.", ur: "دعائیں، نماز، آداب اور بنیادی عقیدہ۔" },
    intro: {
      en: "A practical foundation in everyday Islam: the daily Duas, how to pray Salah correctly, good Islamic manners (akhlaq) and the basics of belief (Aqeedah) — taught gently and age-appropriately.",
      ur: "روزمرہ اسلام کی عملی بنیاد: روزانہ کی دعائیں، نماز کا درست طریقہ، اچھے اسلامی آداب اور بنیادی عقیدہ — نرمی اور عمر کے مطابق پڑھایا جاتا ہے۔",
    },
    whoFor: { en: "Children and adults wanting practical Islamic knowledge.", ur: "بچے اور بڑے جو عملی اسلامی علم چاہتے ہیں۔" },
    modules: {
      en: [
        "Daily & occasional Duas (masnoon)",
        "Wudu & Salah step by step",
        "Pillars of Islam & Iman",
        "Islamic manners & character",
        "Basic Aqeedah (beliefs)",
        "Stories of the Prophets",
      ],
      ur: [
        "روزمرہ و موقع کی مسنون دعائیں",
        "وضو اور نماز قدم بہ قدم",
        "ارکانِ اسلام و ایمان",
        "اسلامی آداب و اخلاق",
        "بنیادی عقیدہ",
        "انبیاء کرام کے قصے",
      ],
    },
    outcomes: {
      en: ["Pray Salah confidently", "Know daily Duas by heart", "Build strong Islamic character"],
      ur: ["اعتماد سے نماز ادا کریں", "روزانہ کی دعائیں یاد کریں", "مضبوط اسلامی کردار بنائیں"],
    },
  },
  {
    slug: "quran-translation",
    gradient: "from-fuchsia-500 to-purple-600",
    name: { en: "Quran Translation & Understanding", ur: "قرآن ترجمہ و فہم" },
    tagline: { en: "Understand selected Surahs and their meanings.", ur: "منتخب سورتوں اور ان کے معانی کو سمجھیں۔" },
    intro: {
      en: "Move from reading to understanding. Students study the word meanings and message of selected Surahs, with simple, age-appropriate explanation that connects the Quran to daily life.",
      ur: "پڑھنے سے سمجھنے کی طرف بڑھیں۔ طلبہ منتخب سورتوں کے الفاظ کے معانی اور پیغام کا مطالعہ کرتے ہیں، آسان اور عمر کے مطابق وضاحت کے ساتھ جو قرآن کو روزمرہ زندگی سے جوڑتی ہے۔",
    },
    whoFor: { en: "Students who can recite and want to understand meaning.", ur: "وہ طلبہ جو تلاوت کر لیتے ہیں اور معنی سمجھنا چاہتے ہیں۔" },
    modules: {
      en: [
        "Word-by-word meaning of short Surahs",
        "Themes & message of each Surah",
        "Selected Surahs from Juz Amma",
        "Connecting verses to daily life",
        "Key vocabulary of the Quran",
        "Reflection (tadabbur) basics",
      ],
      ur: [
        "چھوٹی سورتوں کا لفظ بہ لفظ ترجمہ",
        "ہر سورت کے موضوعات و پیغام",
        "پارہ عمّ سے منتخب سورتیں",
        "آیات کا روزمرہ زندگی سے ربط",
        "قرآن کے اہم الفاظ",
        "تدبر کی بنیادی باتیں",
      ],
    },
    outcomes: {
      en: ["Understand selected Surahs", "Grasp core Quranic vocabulary", "Reflect on the Quran's message"],
      ur: ["منتخب سورتیں سمجھیں", "قرآن کے بنیادی الفاظ جانیں", "قرآن کے پیغام پر غور کریں"],
    },
  },
];

export function getQuranCourse(slug: string): QuranCourse | undefined {
  return QURAN_COURSES.find((c) => c.slug === slug);
}
