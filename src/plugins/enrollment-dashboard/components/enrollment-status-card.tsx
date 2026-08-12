import { Circle, CircleCheckBig, TriangleAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnrollmentGoalStatus, EnrollmentProgramMetrics } from "../contracts/types";
import { compositionBarWidths, goalStatus, totalEnrollments } from "../shared/enrollment-metrics";

// Vocabulário oficial "apresentação" do sistema de temas (src/themes/*/theme.css) — status usa
// success/warning/destructive (com par -soft/-border já pronto pros dois primeiros; destructive
// usa opacidade sobre o token base, mesmo padrão do resto do app pra esse caso). Composição
// (rematrícula x nova) usa chart-6/chart-7, o par categórico dedicado — cor de status nunca se
// mistura com cor de composição, são famílias diferentes de propósito.
const STATUS_STYLES: Record<
  EnrollmentGoalStatus,
  { icon: LucideIcon; label: string; text: string; pill: string; cardBg: string; cardBorder: string }
> = {
  met: {
    icon: CircleCheckBig,
    label: "Meta atingida",
    text: "text-presentation-success",
    pill: "bg-presentation-success/20 text-presentation-success",
    cardBg: "bg-presentation-success-soft",
    cardBorder: "border-presentation-success-border",
  },
  "on-track": {
    icon: Circle,
    label: "Em andamento",
    text: "text-presentation-warning",
    pill: "bg-presentation-warning/20 text-presentation-warning",
    cardBg: "bg-presentation-warning-soft",
    cardBorder: "border-presentation-warning-border",
  },
  below: {
    icon: TriangleAlert,
    label: "Abaixo da meta",
    text: "text-presentation-destructive",
    pill: "bg-presentation-destructive/20 text-presentation-destructive",
    cardBg: "bg-presentation-destructive/10",
    cardBorder: "border-presentation-destructive/30",
  },
};

// Cartão único de meta — mesmo componente pra turma (colégio) e curso (faculdade), só o tamanho
// muda (size="lg" quando a instituição tem poucos programas e cada um ganha mais espaço). Cada
// número tem um rótulo explícito acima (TOTAL/META) — antes a meta era só um sufixo pequeno e
// apagado, difícil de identificar o que era o quê.
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
        "flex min-w-0 flex-col rounded-2xl border",
        styles.cardBg,
        styles.cardBorder,
        isLarge ? "gap-4 p-6" : "gap-2 p-3.5",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn("truncate font-bold text-presentation-foreground", isLarge ? "text-2xl" : "text-sm")}>{program.label}</span>
        <span
          className={cn("flex shrink-0 items-center gap-1.5 rounded-full font-bold", styles.pill, isLarge ? "px-3 py-1.5 text-sm" : "px-1.5 py-0.5 text-[0.68rem]")}
        >
          <Icon className={isLarge ? "size-4" : "size-2.5"} />
          {Math.round(ratio * 100)}%
        </span>
      </div>

      <div className="flex items-end gap-5">
        <div>
          <p className={cn("font-bold tracking-wide text-presentation-muted-foreground uppercase", isLarge ? "text-xs" : "text-[0.6rem]")}>Total</p>
          <p className={cn("font-extrabold tabular-nums leading-none", styles.text, isLarge ? "text-6xl" : "text-2xl")}>
            {total.toLocaleString("pt-BR")}
          </p>
        </div>
        <div>
          <p className={cn("font-bold tracking-wide text-presentation-muted-foreground uppercase", isLarge ? "text-xs" : "text-[0.6rem]")}>Meta</p>
          <p className={cn("font-bold tabular-nums leading-none text-presentation-foreground/70", isLarge ? "text-3xl" : "text-base")}>
            {program.goal.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      <div>
        <div className={cn("flex overflow-hidden rounded-full bg-presentation-ground", isLarge ? "h-2.5" : "h-1.5")}>
          <div className="h-full bg-chart-6" style={{ width: `${renewedPercent}%` }} />
          <div className="h-full bg-chart-7" style={{ width: `${newPercent}%` }} />
        </div>
        <div className={cn("mt-1.5 flex items-center gap-3 font-bold tabular-nums", isLarge ? "text-base" : "text-xs")}>
          <span className="flex items-center gap-1.5 text-chart-6">
            <span className="size-2 shrink-0 rounded-full bg-chart-6" />
            {program.renewed.toLocaleString("pt-BR")}
            {isLarge && " rematrículas"}
          </span>
          <span className="flex items-center gap-1.5 text-chart-7">
            <span className="size-2 shrink-0 rounded-full bg-chart-7" />
            {program.newEnrollments.toLocaleString("pt-BR")}
            {isLarge && " novas"}
          </span>
        </div>
      </div>
    </div>
  );
}
