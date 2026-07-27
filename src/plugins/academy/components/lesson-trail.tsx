import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export type LessonTrailItem = {
  id: string;
  position: number;
  title: string;
  state: "completed" | "current" | "unlocked" | "locked";
};

export function LessonTrail({ courseSlug, items }: { courseSlug: string; items: LessonTrailItem[] }) {
  return (
    <nav
      aria-label="Trilha da aula"
      className="sticky top-8 flex flex-col gap-2 rounded-panel border border-border-subtle bg-surface-panel p-4 shadow-panel"
    >
      <p className="text-[11px] font-semibold tracking-caps text-text-tertiary uppercase">Trilha do curso</p>
      <ol className="flex flex-col gap-0.5">
        {items.map((item) => {
          const isLocked = item.state === "locked";
          const isCurrent = item.state === "current";

          const row = (
            <span
              className={cn(
                "flex items-center gap-2 rounded-control px-2 py-1.5 text-sm",
                isCurrent && "bg-accent-soft font-medium text-text-accent",
                !isCurrent && !isLocked && "text-text-secondary",
                isLocked && "text-text-tertiary",
              )}
            >
              {item.state === "completed" ? (
                <Check className="size-3.5 shrink-0 text-success" />
              ) : isLocked ? (
                <Lock className="size-3.5 shrink-0" />
              ) : (
                <span
                  className={cn(
                    "size-3.5 shrink-0 rounded-full border",
                    isCurrent ? "border-text-accent" : "border-text-tertiary",
                  )}
                />
              )}
              <span className="truncate">
                {item.position}. {item.title}
              </span>
            </span>
          );

          return (
            <li key={item.id}>
              {isLocked ? row : <Link href={`/academy/${courseSlug}/${item.id}`}>{row}</Link>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
