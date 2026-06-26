import EnforceTheme from "@/components/EnforceTheme";
import { LangProvider } from "./lang";

// The Quran Learning section defaults to the white/light theme (toggle still
// works) and shares one language choice across all its pages.
export default function QuranLearningLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <EnforceTheme mode="site-light" />
      <LangProvider>{children}</LangProvider>
    </>
  );
}
