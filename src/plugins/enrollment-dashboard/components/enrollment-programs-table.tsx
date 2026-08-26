import { CircleCheckBig } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnrollmentGoalStatus, EnrollmentProgramMetrics } from "../contracts/types";
import { goalStatus, totalEnrollments } from "../shared/enrollment-metrics";
import type { EnrollmentRowDensity } from "../shared/enrollment-density";

const FIGURE_CLASS: Record<EnrollmentGoalStatus, string> = {
  met: "text-presentation-success",
  "on-track": "text-presentation-warning",
  below: "text-presentation-destructive",
};

// cell (padding vertical da linha) maior que antes (pedido explícito: "padding y maior entre os
// itens") — mais respiro entre turmas/cursos na tabela.
const TABLE_DENSITY_STYLES: Record<EnrollmentRowDensity, { head: string; cell: string; name: string; num: string; pct: string; icon: string }> = {
  comfortable: { head: "text-xs pb-2", cell: "py-4", name: "text-xl", num: "text-lg", pct: "text-xl", icon: "size-5" },
  compact: { head: "text-[11px] pb-1.5", cell: "py-2.5", name: "text-lg", num: "text-base", pct: "text-lg", icon: "size-4" },
  dense: { head: "text-[10px] pb-1", cell: "py-1.5", name: "text-base", num: "text-sm", pct: "text-base", icon: "size-3.5" },
};

// Turmas/cursos viram linhas de tabela (pedido explícito: "as turmas se tornam linhas de tabela")
// em vez do card empilhado anterior. Só 4 colunas (Turma/Rematrículas/Novas/%) — Total e Meta
// ficaram de fora de propósito: Total/Meta continuam visíveis agregados no card do cabeçalho do
// grupo (enrollment-columns-slide.tsx), não somem da informação, só não se repetem por linha.
// Selo "Meta atingida" virou um ícone antes do nome (cor + ícone, decodificável junto com a
// legenda de cores no fim da página) em vez de texto solto; fundo levemente tingido de verde na
// linha inteira mantém o destaque.
//
// Sem table-fixed/colgroup/truncate de propósito — a tabela renderiza na largura NATURAL do
// conteúdo (whitespace-nowrap em toda célula evita quebra estranha no meio da frase), e quem
// corrige um resultado maior que a caixa disponível é o EnrollmentFitScale por fora (ver
// enrollment-columns-slide.tsx) escalando o conjunto inteiro, nunca truncando texto no meio da
// palavra (achado real e repetido: "REMATR."/nome de turma cortando com "…" no meio quando a
// coluna do slide era mais estreita que 16:9 — ver comentário em enrollment-fit-scale.tsx).
export function EnrollmentProgramsTable({ programs, density }: { programs: EnrollmentProgramMetrics[]; density: EnrollmentRowDensity }) {
  const styles = TABLE_DENSITY_STYLES[density];

  return (
    <table className="border-collapse">
      <thead>
        <tr
          className={cn(
            "border-b-2 border-presentation-border text-left font-bold uppercase tracking-caps text-presentation-muted-foreground",
            styles.head,
          )}
        >
          <th className="whitespace-nowrap pr-4 font-bold">Turma</th>
          <th className="whitespace-nowrap px-4 text-right font-bold">Rematr.</th>
          <th className="whitespace-nowrap px-4 text-right font-bold">Novas</th>
          <th className="whitespace-nowrap pl-4 text-right font-bold">%</th>
        </tr>
      </thead>
      <tbody>
        {programs.map((program) => {
          const status = goalStatus(program);
          const total = totalEnrollments(program);
          const ratio = program.goal > 0 ? total / program.goal : 0;
          const met = status === "met";

          return (
            <tr key={program.id} className={cn("border-b border-presentation-border/40 last:border-b-0", met && "bg-presentation-success-soft")}>
              <td className={cn("whitespace-nowrap pr-4 font-extrabold text-presentation-foreground", styles.cell, styles.name)}>
                <span className="flex items-center gap-1.5">
                  {met && <CircleCheckBig className={cn("shrink-0 text-presentation-success", styles.icon)} aria-hidden />}
                  {program.label}
                </span>
              </td>
              <td className={cn("whitespace-nowrap px-4 text-right font-bold tabular-nums text-presentation-renewed", styles.cell, styles.num)}>
                {program.renewed.toLocaleString("pt-BR")}
              </td>
              <td className={cn("whitespace-nowrap px-4 text-right font-bold tabular-nums text-presentation-new", styles.cell, styles.num)}>
                {program.newEnrollments.toLocaleString("pt-BR")}
              </td>
              <td className={cn("whitespace-nowrap pl-4 text-right font-extrabold tabular-nums", styles.cell, styles.pct, FIGURE_CLASS[status])}>
                {Math.round(ratio * 100)}%
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
