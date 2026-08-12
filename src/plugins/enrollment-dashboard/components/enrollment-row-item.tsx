import { CircleCheckBig } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnrollmentGoalStatus, EnrollmentProgramMetrics } from "../contracts/types";
import { compositionBarWidths, goalStatus, totalEnrollments } from "../shared/enrollment-metrics";

const FIGURE_CLASS: Record<EnrollmentGoalStatus, string> = {
  met: "text-presentation-success",
  "on-track": "text-presentation-warning",
  below: "text-presentation-destructive",
};

const PCT_CLASS: Record<EnrollmentGoalStatus, string> = FIGURE_CLASS;

// Linha de turma — pedido explícito: nome em cima, resto embaixo; quantidade de rematrícula/nova
// matrícula/meta sempre por extenso (não só a barra); turma que bateu a meta precisa se destacar
// (fundo levemente tingido de verde + selo "Meta atingida", em vez de só um número verde perdido
// no meio da lista). Cor de status (número/selo) é uma família; cor de composição (barra/pontos)
// é outra — mesma separação do resto do dashboard.
export function EnrollmentRowItem({ program }: { program: EnrollmentProgramMetrics }) {
  const status = goalStatus(program);
  const total = totalEnrollments(program);
  const ratio = program.goal > 0 ? total / program.goal : 0;
  const { renewedPercent, newPercent } = compositionBarWidths(program);
  const met = status === "met";

  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 rounded-xl border-b border-presentation-border/60 px-3 py-3.5 last:border-b-0",
        met && "rounded-xl border-b-0 bg-presentation-success-soft",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-lg font-bold text-presentation-foreground">{program.label}</span>
        {met && (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-presentation-success/25 px-2.5 py-1 text-xs font-bold text-presentation-success">
            <CircleCheckBig className="size-3.5" />
            Meta atingida
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-3">
        <span className={cn("text-3xl font-extrabold tabular-nums leading-none", FIGURE_CLASS[status])}>{total.toLocaleString("pt-BR")}</span>
        <span className="text-base font-semibold text-presentation-muted-foreground">de {program.goal.toLocaleString("pt-BR")}</span>
        <span className={cn("ml-auto shrink-0 text-lg font-extrabold tabular-nums", PCT_CLASS[status])}>{Math.round(ratio * 100)}%</span>
      </div>

      <div className="flex overflow-hidden rounded-full bg-presentation-ground" style={{ height: 10 }}>
        <div className="h-full bg-presentation-renewed" style={{ width: `${renewedPercent}%` }} />
        <div className="h-full bg-presentation-new" style={{ width: `${newPercent}%` }} />
      </div>

      <div className="flex items-center gap-4 text-sm font-bold tabular-nums">
        <span className="flex items-center gap-1.5 text-presentation-renewed">
          <span className="size-2 shrink-0 rounded-full bg-presentation-renewed" />
          {program.renewed.toLocaleString("pt-BR")} rematrículas
        </span>
        <span className="flex items-center gap-1.5 text-presentation-new">
          <span className="size-2 shrink-0 rounded-full bg-presentation-new" />
          {program.newEnrollments.toLocaleString("pt-BR")} novas
        </span>
      </div>
    </div>
  );
}
