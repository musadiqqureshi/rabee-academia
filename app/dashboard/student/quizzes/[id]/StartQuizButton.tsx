"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import { startAttempt } from "../actions";

export default function StartQuizButton({ quizId, resuming }: { quizId: string; resuming: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          await startAttempt(quizId);
          router.refresh();
        })
      }
      disabled={pending}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold shadow-md hover:opacity-90 disabled:opacity-60"
    >
      <Play className="w-4 h-4" /> {pending ? "Starting…" : resuming ? "Resume quiz" : "Start quiz"}
    </button>
  );
}
