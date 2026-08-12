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

// Coluna de resumo geral — pedido explícito: "a coluna dos anéis deve estar ao lado das turmas,
// como a primeira coluna" (não mais no cabeçalho). Mesmo tratamento de cabeçalho das colunas de
// turma/curso (título + traço), mas o corpo é o resumo em três anéis em vez de linhas de lista —
// é a leitura no nível da instituição inteira, complementar aos totais que cada coluna de turma/
// curso já mostra no nível do segmento/curso.
export function EnrollmentSummaryColumn({ totals }: { totals: { goal: number; renewed: number; newEnrollments: number } }) {
  const total = totals.renewed + totals.newEnrollments;
  const retention = retentionRatio(totals);
  const status = goalStatus(totals);

  return (
    <div className="flex min-h-0 flex-col">
      <div className="mb-4 border-b-2 border-presentation-border pb-3">
        <h2 className="truncate text-base font-extrabold tracking-caps text-presentation-foreground uppercase">Geral</h2>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
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

        <div className="flex flex-col items-center gap-2">
          <EnrollmentRing value={totals.renewed} goal={totals.goal} colorVar="var(--presentation-renewed)" size={116} />
          <div className="text-center">
            <p className="text-base font-bold text-presentation-foreground">Rematrículas</p>
            <p className="text-sm font-semibold text-presentation-renewed">{Math.round(retention * 100)}% de retenção</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <EnrollmentRing value={totals.newEnrollments} goal={totals.goal} colorVar="var(--presentation-new)" size={116} />
          <div className="text-center">
            <p className="text-base font-bold text-presentation-foreground">Novas matrículas</p>
            <p className="text-sm font-semibold text-presentation-new">
              {totals.goal > 0 ? Math.round((totals.newEnrollments / totals.goal) * 100) : 0}% da meta
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <EnrollmentRing value={total} goal={totals.goal} colorVar={RING_COLOR[status]} size={116} />
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
