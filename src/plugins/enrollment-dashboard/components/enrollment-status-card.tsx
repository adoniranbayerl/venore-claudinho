import { Circle, CircleCheckBig, TriangleAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnrollmentGoalStatus, EnrollmentProgramMetrics } from "../contracts/types";
import { compositionBarWidths, goalStatus, totalEnrollments } from "../shared/enrollment-metrics";

const STATUS_STYLES: Record<
  EnrollmentGoalStatus,
  { icon: LucideIcon; text: string; pill: string; cardBg: string; cardBorder: string }
> = {
  met: {
    icon: CircleCheckBig,
    text: "text-presentation-success",
    pill: "bg-presentation-success/20 text-presentation-success",
    cardBg: "bg-presentation-success-bg",
    cardBorder: "border-presentation-success-border",
  },
  "on-track": {
    icon: Circle,
    text: "text-presentation-warning",
    pill: "bg-presentation-warning/20 text-presentation-warning",
    cardBg: "bg-presentation-warning-bg",
    cardBorder: "border-presentation-warning-border",
  },
  below: {
    icon: TriangleAlert,
    text: "text-presentation-critical",
    pill: "bg-presentation-critical/20 text-presentation-critical",
    cardBg: "bg-presentation-critical-bg",
    cardBorder: "border-presentation-critical-border",
  },
};

// Cartão único de meta — mesmo componente pra turma (colégio) e curso (faculdade), só o
// tamanho muda (size="lg" quando a instituição tem poucos programas e cada um ganha mais
// espaço). Cor de status (fundo/número/pill) é uma família; cor de composição (barra/pontinhos)
// é outra, de propósito — nunca a mesma, senão "de onde veio a matrícula" se confunde com "está
// indo bem" (ver comentário em theme.css sobre --presentation-renewed/--presentation-new).
export function EnrollmentStatusCard({ program, size = "sm" }: { program: EnrollmentProgramMetrics; size?: "sm" | "lg" }) {
  const status = goalStatus(program);
  const styles = STATUS_STYLES[status];
  const Icon = styles.icon;
  const total = totalEnrollments(program);
  const ratio = program.goal > 0 ? total / program.goal : 0;
  const { renewedPercent, newPercent } = compositionBarWidths(program);
  const isLarge = size === "lg";

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col rounded-xl border",
        styles.cardBg,
        styles.cardBorder,
        isLarge ? "gap-3 p-5" : "gap-1.5 p-3",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn("truncate font-semibold text-presentation-foreground", isLarge ? "text-lg" : "text-sm")}>{program.label}</span>
        <span className={cn("flex shrink-0 items-center gap-1 rounded-full font-bold", styles.pill, isLarge ? "px-2.5 py-1 text-xs" : "px-1.5 py-0.5 text-[0.62rem]")}>
          <Icon className={isLarge ? "size-3.5" : "size-2.5"} />
          {Math.round(ratio * 100)}%
        </span>
      </div>

      <div className={cn("flex items-baseline gap-1.5 font-extrabold tabular-nums", styles.text, isLarge ? "text-4xl" : "text-2xl")}>
        {total.toLocaleString("pt-BR")}
        <span className="text-[0.5em] font-bold tracking-wide text-presentation-muted-foreground uppercase">meta {program.goal.toLocaleString("pt-BR")}</span>
      </div>

      <div className={cn("flex overflow-hidden rounded-full bg-presentation-ground", isLarge ? "h-2" : "h-1.5")}>
        <div className="h-full bg-presentation-renewed" style={{ width: `${renewedPercent}%` }} />
        <div className="h-full bg-presentation-new" style={{ width: `${newPercent}%` }} />
      </div>

      <div className={cn("flex items-center gap-2.5 font-bold tabular-nums", isLarge ? "text-sm" : "text-[0.68rem]")}>
        <span className="flex items-center gap-1 text-presentation-renewed">
          <span className="size-1.5 shrink-0 rounded-full bg-presentation-renewed" />
          {program.renewed.toLocaleString("pt-BR")}
          {isLarge && " rematr."}
        </span>
        <span className="flex items-center gap-1 text-presentation-new">
          <span className="size-1.5 shrink-0 rounded-full bg-presentation-new" />
          {program.newEnrollments.toLocaleString("pt-BR")}
          {isLarge && " novas"}
        </span>
      </div>
    </div>
  );
}
