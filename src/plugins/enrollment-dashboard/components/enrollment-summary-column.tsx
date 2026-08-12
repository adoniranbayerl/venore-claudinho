import { cn } from "@/lib/utils";
import { goalStatus, retentionRatio } from "../shared/enrollment-metrics";
import { EnrollmentRing } from "./enrollment-ring";

const RING_COLOR = {
  met: "var(--presentation-success)",
  "on-track": "var(--presentation-warning)",
  below: "var(--presentation-destructive)",
} as const;

const RING_CAPTION_CLASS = {
  met: "text-presentation-success",
  "on-track": "text-presentation-warning",
  below: "text-presentation-destructive",
} as const;

// Coluna de resumo geral — primeira coluna do grid, ao lado das turmas/cursos (pedido explícito).
// Mesmo tratamento de cabeçalho das colunas de turma/curso (título + traço na mesma altura —
// min-h-16 força isso mesmo sem a segunda linha de estatística que as outras colunas têm) e
// ancorada no topo (justify-start, não mais centralizada). Anéis em w-full/aspect-square (ver
// enrollment-ring.tsx) crescem até o limite do próprio container — na faculdade (coluna larga,
// só 2 no grid) ficam bem maiores que no colégio (coluna estreita, 5 no grid), proporcional ao
// espaço de cada caso, não um px fixo.
export function EnrollmentSummaryColumn({ totals }: { totals: { goal: number; renewed: number; newEnrollments: number } }) {
  const total = totals.renewed + totals.newEnrollments;
  const retention = retentionRatio(totals);
  const status = goalStatus(totals);

  return (
    <div className="flex min-h-0 flex-col">
      <div className="mb-4 min-h-16 border-b-2 border-presentation-border pb-3">
        <h2 className="truncate text-base font-extrabold tracking-caps text-presentation-foreground uppercase">Geral</h2>
      </div>

      <div className="flex flex-1 flex-col items-center justify-start gap-6">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-presentation-muted-foreground">
            <span className="size-2 shrink-0 rounded-full bg-presentation-renewed" />
            Rematrícula
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-presentation-muted-foreground">
            <span className="size-2 shrink-0 rounded-full bg-presentation-new" />
            Nova
          </span>
        </div>

        <div className="flex w-full flex-col items-center gap-2">
          <EnrollmentRing value={totals.renewed} goal={totals.goal} colorVar="var(--presentation-renewed)" />
          <div className="text-center">
            <p className="text-base font-bold text-presentation-foreground">Rematrículas</p>
            <p className="text-sm font-semibold text-presentation-renewed">{Math.round(retention * 100)}% de retenção</p>
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-2">
          <EnrollmentRing value={totals.newEnrollments} goal={totals.goal} colorVar="var(--presentation-new)" />
          <div className="text-center">
            <p className="text-base font-bold text-presentation-foreground">Novas matrículas</p>
            <p className="text-sm font-semibold text-presentation-new">
              {totals.goal > 0 ? Math.round((totals.newEnrollments / totals.goal) * 100) : 0}% da meta
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-2">
          <EnrollmentRing value={total} goal={totals.goal} colorVar={RING_COLOR[status]} />
          <div className="text-center">
            <p className="text-base font-bold text-presentation-foreground">Meta: {totals.goal.toLocaleString("pt-BR")}</p>
            <p className={cn("text-sm font-semibold", RING_CAPTION_CLASS[status])}>
              {totals.goal > 0 ? Math.round((total / totals.goal) * 100) : 0}% atingido
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
