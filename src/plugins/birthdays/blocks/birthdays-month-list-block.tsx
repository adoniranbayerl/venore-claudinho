import { Cake } from "lucide-react";
import { listPublicBirthdaysHandler as listPublicBirthdays } from "../features/list-public-birthdays/handler";
import { MONTH_LABELS } from "../shared/months";
import type { BlockRendererProps } from "@/platform/page-builder/block-renderers";
import { hasRichTextContent, renderRichTextContent, RICH_TEXT_INLINE_CLASSES } from "@/platform/page-builder/rich-text/render";
import { cn } from "@/lib/utils";

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
  const description = block.data.description;
  const emptyMessage = hasRichTextContent(block.data.emptyMessage)
    ? block.data.emptyMessage
    : "Não há aniversariantes cadastrados para este mês.";
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

  // "Próximo primeiro": hoje e quem ainda vai fazer aniversário este mês aparecem antes de quem já
  // fez — achado da revisão de blocos desta sessão (antes só ordenava por dia, misturando quem já
  // passou com quem ainda vem). MAX_DAYS_IN_MONTH (31) como deslocamento garante que o grupo "já
  // passou" sempre vem depois do grupo "ainda vem", mantendo ordem crescente dentro de cada grupo.
  const MAX_DAYS_IN_MONTH = 31;
  function rank(day: number): number {
    return day >= today ? day - today : day - today + MAX_DAYS_IN_MONTH;
  }

  const monthBirthdays = result.data
    .filter((birthday) => birthday.month === currentMonth)
    .sort((a, b) => rank(a.day) - rank(b.day))
    .slice(0, limit);

  return (
    <div className="rounded-panel border border-border bg-card p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {hasRichTextContent(description) && (
            <div className={cn("mt-1 text-sm text-muted-foreground", RICH_TEXT_INLINE_CLASSES)}>{renderRichTextContent(description)}</div>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {MONTH_LABELS[currentMonth]}
        </span>
      </div>

      {monthBirthdays.length === 0 ? (
        <div className={cn("mt-4 text-sm text-muted-foreground", RICH_TEXT_INLINE_CLASSES)}>{renderRichTextContent(emptyMessage)}</div>
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
