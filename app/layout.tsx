import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  metadataBase: new URL("https://rabeeacademia.com"),
  title: "Rabee Academia — Smart Online Learning for Future Achievers",
  description:
    "Rabee Academia provides modern online learning for FSc Medical, FSc Engineering, A/O Levels, BS, and MS students with expert teachers, AI-powered academic support, and flexible regular or weekend classes.",
  keywords: [
    "Rabee Academia",
    "FSc tuition",
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
  ],
  authors: [{ name: "Rabee Academia" }],
  robots: "index, follow",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Rabee Academia — Smart Online Learning for Future Achievers",
    description:
      "Expert teachers. AI-powered support. Flexible classes. Join students from 5 countries learning FSc, A/O Levels, BS & MS at Rabee Academia.",
    type: "website",
    url: "https://rabeeacademia.com",
    siteName: "Rabee Academia",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rabee Academia — Smart Online Learning",
    description:
      "Expert teachers. AI-powered support. Flexible classes. FSc, A/O Levels, BS & MS.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
      </head>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
