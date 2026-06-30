import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Colorful gradient hero banner for dashboard overviews.
export default function WelcomeBanner({
  title, subtitle, cta,
}: { title: string; subtitle: string; cta?: { label: string; href: string } }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-6 md:p-8 text-white shadow-lg">
      <div className="absolute -top-12 -right-10 w-44 h-44 rounded-full bg-white/10" />
      <div className="absolute -bottom-16 right-28 w-36 h-36 rounded-full bg-white/5" />
      <div className="relative">
        <h1 className="text-xl md:text-2xl font-extrabold">{title}</h1>
        <p className="text-sm text-white/85 mt-1.5 max-w-xl">{subtitle}</p>
        {cta && (
          <Link href={cta.href} className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-indigo-700 text-sm font-bold hover:bg-white/90 transition-colors">
            {cta.label} <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
