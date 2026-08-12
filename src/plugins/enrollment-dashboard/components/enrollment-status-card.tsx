import { CircleCheckBig, Circle, TriangleAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnrollmentGoalStatus, EnrollmentProgramMetrics } from "../contracts/types";
import { compositionBarWidths, goalStatus, totalEnrollments } from "../shared/enrollment-metrics";

// Vocabulário oficial "apresentação" do sistema de temas — status usa success/warning/destructive
// (par -soft/-border pronto pros dois primeiros; destructive usa opacidade sobre o token base).
// "met" ganha um tratamento à parte (ver JSX abaixo: selo "Meta atingida" em vez de só a pct) —
// pedido explícito de destacar quem bateu a meta, não só colorir o número.
const STATUS_STYLES: Record<
  EnrollmentGoalStatus,
  { icon: LucideIcon; label: string; text: string; pill: string; cardBg: string; cardBorder: string }
> = {
  met: {
    icon: CircleCheckBig,
    label: "Meta atingida",
    text: "text-presentation-success",
    pill: "bg-presentation-success/25 text-presentation-success",
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

// Cartão grande — usado só pela faculdade (poucos cursos, cada um com bastante espaço). Nome em
// cima, resto embaixo; quem bate a meta ganha um selo "Meta atingida" em vez da pct simples, pra
// se destacar de verdade na fileira.
export function EnrollmentStatusCard({ program }: { program: EnrollmentProgramMetrics }) {
  const status = goalStatus(program);
  const styles = STATUS_STYLES[status];
  const Icon = styles.icon;
  const total = totalEnrollments(program);
  const ratio = program.goal > 0 ? total / program.goal : 0;
  const { renewedPercent, newPercent } = compositionBarWidths(program);
  const met = status === "met";

  return (
    <div className={cn("flex min-w-0 flex-col gap-5 rounded-2xl border p-7", styles.cardBg, styles.cardBorder)}>
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-2xl font-bold text-presentation-foreground">{program.label}</span>
        <span className={cn("flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold", styles.pill)}>
          <Icon className="size-4" />
          {met ? styles.label : `${Math.round(ratio * 100)}%`}
        </span>
      </div>

      <div className="flex items-baseline gap-3">
        <span className={cn("text-7xl font-extrabold tabular-nums leading-none", styles.text)}>{total.toLocaleString("pt-BR")}</span>
        <span className="text-2xl font-semibold text-presentation-muted-foreground">de {program.goal.toLocaleString("pt-BR")}</span>
      </div>

      <div className="flex overflow-hidden rounded-full bg-presentation-ground" style={{ height: 14 }}>
        <div className="h-full bg-presentation-renewed" style={{ width: `${renewedPercent}%` }} />
        <div className="h-full bg-presentation-new" style={{ width: `${newPercent}%` }} />
      </div>

      <div className="flex items-center gap-6 text-base font-bold tabular-nums">
        <span className="flex items-center gap-2 text-presentation-renewed">
          <span className="size-2.5 shrink-0 rounded-full bg-presentation-renewed" />
          {program.renewed.toLocaleString("pt-BR")} rematrículas
        </span>
        <span className="flex items-center gap-2 text-presentation-new">
          <span className="size-2.5 shrink-0 rounded-full bg-presentation-new" />
          {program.newEnrollments.toLocaleString("pt-BR")} novas
        </span>
      </div>
    </div>
  );
}
