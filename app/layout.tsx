import type { Metadata, Viewport } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { courses } from "@/lib/courses";

const SITE_URL = "https://rabeeacademia.site";
const SITE_NAME = "Rabee Academia";
const DESCRIPTION =
  "Rabee Academia is a premium online academy for FSc Pre-Medical & Pre-Engineering, O/A Levels, BS and MS students — expert teachers, AI-powered academic support, and flexible regular or weekend live classes for students across 5 countries.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Rabee Academia — Smart Online Learning for Future Achievers",
    template: "%s | Rabee Academia",
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Rabee Academia",
    "online academy Pakistan",
    "FSc tuition",
    "FSc Pre-Medical",
    "FSc Pre-Engineering",
    "A Level tuition",
    "O Level tuition",
    "BS tuition",
    "MS tuition",
    "online tuition Pakistan",
    "AI learning",
    "Physics tuition",
    "Chemistry tuition",
    "Mathematics tuition",
    "Biology tuition",
    "Computer Science tuition",
    "online classes Google Meet",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "education",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
  openGraph: {
    title: "Rabee Academia — Smart Online Learning for Future Achievers",
    description: DESCRIPTION,
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    images: [
      { url: "/opengraph.jpg", width: 1200, height: 630, alt: "Rabee Academia — Premium Online Academy" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rabee Academia — Smart Online Learning",
    description:
      "Expert teachers. AI-powered support. Flexible live classes. FSc, A/O Levels, BS & MS — for students across 5 countries.",
    images: ["/opengraph.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// Structured data for rich results (search + knowledge panel).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.svg`,
      image: `${SITE_URL}/opengraph.jpg`,
      description: DESCRIPTION,
      email: "info@rabeeacademia.site",
      areaServed: ["Pakistan", "Saudi Arabia", "UAE", "Qatar", "United Kingdom"],
      address: { "@type": "PostalAddress", addressCountry: "PK" },
      sameAs: [] as string[],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en",
    },
    // Helps Google surface sitelinks (sub-pages under the main result).
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}/#sitenav`,
      name: "Rabee Academia",
      itemListElement: [
        { "@type": "SiteNavigationElement", position: 1, name: "Home", url: `${SITE_URL}/` },
        { "@type": "SiteNavigationElement", position: 2, name: "Pricing", url: `${SITE_URL}/pricing` },
        { "@type": "SiteNavigationElement", position: 3, name: "Book a Demo", url: `${SITE_URL}/demo` },
        { "@type": "SiteNavigationElement", position: 4, name: "Enroll", url: `${SITE_URL}/enroll` },
        { "@type": "SiteNavigationElement", position: 5, name: "FAQ", url: `${SITE_URL}/faq` },
        { "@type": "SiteNavigationElement", position: 6, name: "AI Tools", url: `${SITE_URL}/products` },
        { "@type": "SiteNavigationElement", position: 7, name: "AI Career Stack", url: `${SITE_URL}/ai-career-stack` },
        { "@type": "SiteNavigationElement", position: 8, name: "Sign in", url: `${SITE_URL}/login` },
      ],
    },
    // Course catalogue — helps Google & AI assistants understand and recommend
    // our specific courses (AEO/GEO).
    ...courses.map((c) => ({
      "@type": "Course",
      name: c.name,
      description: c.description,
      provider: { "@id": `${SITE_URL}/#organization` },
      educationalLevel: c.level,
      ...(c.free
        ? {}
        : {
            offers: {
              "@type": "Offer",
              price: c.regularPrice,
              priceCurrency: "PKR",
              category: "monthly",
              url: `${SITE_URL}/pricing`,
            },
          }),
    })),
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* No-flash theme: marketing site = dark (saved pref), app pages = light */}
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var p=location.pathname;var app=p.indexOf('/dashboard')===0||p.indexOf('/login')===0||p.indexOf('/register')===0||p.indexOf('/auth')===0;var quran=p.indexOf('/quran-learning')===0;var t=localStorage.getItem('site-theme');var d;if(app){d=false;}else if(quran){d=t?t==='dark':false;}else{d=t?t==='dark':true;}document.documentElement.classList.toggle('dark',d);}catch(e){}})();",
          }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
