import { Cake } from "lucide-react";
import { listPublicBirthdaysHandler as listPublicBirthdays } from "../features/list-public-birthdays/handler";
import { MONTH_LABELS } from "../shared/months";
import type { BlockRendererProps } from "@/platform/page-builder/block-renderers";

function readString(data: Record<string, unknown>, key: string, fallback: string): string {
  const value = data[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function readLimit(data: Record<string, unknown>, fallback: number): number {
  const value = data.limit;
  return typeof value === "number" && value > 0 ? value : fallback;
}

export async function BirthdaysMonthListBlock({ block }: BlockRendererProps) {
  const title = readString(block.data, "title", "Aniversariantes do mês");
  const description = readString(block.data, "description", "");
  const emptyMessage = readString(block.data, "emptyMessage", "Não há aniversariantes cadastrados para este mês.");
  const limit = readLimit(block.data, 12);

  const result = await listPublicBirthdays();
  // Handler é público (sem auth) — um erro aqui é de infraestrutura, não de permissão. Bloco some
  // em vez de quebrar a página, mesmo padrão de AcademyCourseListBlock.
  if (!result.success) {
    return null;
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const today = now.getDate();

  const monthBirthdays = result.data
    .filter((birthday) => birthday.month === currentMonth)
    .sort((a, b) => a.day - b.day)
    .slice(0, limit);

  return (
    <div className="rounded-panel border border-border bg-card p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {MONTH_LABELS[currentMonth]}
        </span>
      </div>

      {monthBirthdays.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {monthBirthdays.map((birthday) => {
            const isToday = birthday.day === today;
            return (
              <li
                key={birthday.id}
                className={
                  isToday
                    ? "flex items-center gap-3 rounded-panel border border-primary/40 bg-primary/5 p-2.5"
                    : "flex items-center gap-3 rounded-panel p-2.5"
                }
              >
                <span
                  className={
                    isToday
                      ? "flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
                      : "flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground"
                  }
                >
                  {String(birthday.day).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{birthday.fullName}</p>
                  {birthday.role && <p className="truncate text-xs text-muted-foreground">{birthday.role}</p>}
                </div>
                {isToday && (
                  <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
                    <Cake className="size-3.5" />
                    Hoje
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
