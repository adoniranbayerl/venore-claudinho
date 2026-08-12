import { cn } from "@/lib/utils";
import type { EnrollmentInstitution } from "../contracts/types";
import { goalStatus, retentionRatio } from "../shared/enrollment-metrics";
import { InstitutionLogo } from "./institution-logo";
import { EnrollmentRing } from "./enrollment-ring";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

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

// Cabeçalho compartilhado pelos slides de TV — logo (sem caixa/borda, tamanho normal — pedido
// explícito) + data de atualização à esquerda; à direita, o resumo geral em três anéis
// (rematrícula, nova matrícula, meta), um por linha numa coluna só, maiores que antes (pedido
// explícito). Mantido de propósito ("os anéis indicam o geral, deve manter"): é a leitura no
// nível da instituição inteira, complementar aos totais que cada coluna já mostra no nível do
// segmento/curso. Anéis normalizados pela mesma meta (rematrícula/meta + nova/meta = total/meta)
// — o de meta é visualmente a soma dos outros dois e usa a cor de status da instituição como um
// todo.
export function InstitutionSlideHeader({
  institution,
  logoUrl,
  totals,
}: {
  institution: EnrollmentInstitution;
  logoUrl: string | null;
  totals: { goal: number; renewed: number; newEnrollments: number };
}) {
  const total = totals.renewed + totals.newEnrollments;
  const retention = retentionRatio(totals);
  const status = goalStatus(totals);

  return (
    <header className="flex shrink-0 items-start justify-between gap-8">
      <div className="flex items-center gap-4">
        <InstitutionLogo url={logoUrl} name={institution.name} className="h-24 w-auto" />
        <p className="text-base text-presentation-muted-foreground">Atualizado em {dateFormatter.format(new Date())}</p>
      </div>

      <div className="flex flex-col items-end gap-4">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-sm font-semibold text-presentation-muted-foreground">
            <span className="size-2.5 shrink-0 rounded-full bg-presentation-renewed" />
            Rematrícula
          </span>
          <span className="flex items-center gap-2 text-sm font-semibold text-presentation-muted-foreground">
            <span className="size-2.5 shrink-0 rounded-full bg-presentation-new" />
            Nova matrícula
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <EnrollmentRing value={totals.renewed} goal={totals.goal} colorVar="var(--presentation-renewed)" size={116} />
            <div>
              <p className="text-lg font-bold text-presentation-foreground">Rematrículas</p>
              <p className="text-sm font-semibold text-presentation-renewed">{Math.round(retention * 100)}% de retenção</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <EnrollmentRing value={totals.newEnrollments} goal={totals.goal} colorVar="var(--presentation-new)" size={116} />
            <div>
              <p className="text-lg font-bold text-presentation-foreground">Novas matrículas</p>
              <p className="text-sm font-semibold text-presentation-new">
                {totals.goal > 0 ? Math.round((totals.newEnrollments / totals.goal) * 100) : 0}% da meta
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <EnrollmentRing value={total} goal={totals.goal} colorVar={RING_COLOR[status]} size={116} />
            <div>
              <p className="text-lg font-bold text-presentation-foreground">Meta: {totals.goal.toLocaleString("pt-BR")}</p>
              <p className={cn("text-sm font-semibold", RING_CAPTION_CLASS[status])}>
                {totals.goal > 0 ? Math.round((total / totals.goal) * 100) : 0}% atingido
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
