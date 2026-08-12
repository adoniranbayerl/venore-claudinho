import { cn } from "@/lib/utils";
import type { EnrollmentInstitution } from "../contracts/types";
import { goalStatus, retentionRatio } from "../shared/enrollment-metrics";
import { InstitutionLogo } from "./institution-logo";
import { EnrollmentRing } from "./enrollment-ring";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

const META_RING_COLOR = {
  met: "var(--presentation-success)",
  "on-track": "var(--presentation-warning)",
  below: "var(--presentation-destructive)",
} as const;

const META_CAPTION_CLASS = {
  met: "text-presentation-success",
  "on-track": "text-presentation-warning",
  below: "text-presentation-destructive",
} as const;

// Cabeçalho compartilhado pelos dois slides de TV — identidade à esquerda; à direita, três anéis
// (pedido explícito: "utilize gráfico donuts" pra rematrícula, nova matrícula e meta, cada um com
// a quantidade e o % — não um donut combinado só). Os três são normalizados pela mesma meta
// (rematrícula/meta + nova/meta = total/meta), por isso o anel de meta é visualmente a soma dos
// outros dois — e usa a cor de status (verde/âmbar/vermelho) da instituição como um todo, os
// outros dois usam a cor fixa de composição (rematrícula/nova). Tudo ancorado no topo
// (items-start), não centralizado.
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
      <div className="flex items-start gap-5">
        <InstitutionLogo
          url={logoUrl}
          name={institution.name}
          className="size-16 border-presentation-border bg-presentation-card text-presentation-muted-foreground"
        />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-presentation-foreground">{institution.name}</h1>
          <p className="text-base text-presentation-muted-foreground">{dateFormatter.format(new Date())}</p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-3">
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

        <div className="flex items-start gap-8">
          <div className="flex flex-col items-center gap-2">
            <EnrollmentRing value={totals.renewed} goal={totals.goal} colorVar="var(--presentation-renewed)" />
            <div className="text-center">
              <p className="text-sm font-bold text-presentation-foreground">Rematrículas</p>
              <p className="text-xs font-semibold text-presentation-renewed">{Math.round(retention * 100)}% de retenção</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <EnrollmentRing value={totals.newEnrollments} goal={totals.goal} colorVar="var(--presentation-new)" />
            <div className="text-center">
              <p className="text-sm font-bold text-presentation-foreground">Novas matrículas</p>
              <p className="text-xs font-semibold text-presentation-new">
                {totals.goal > 0 ? Math.round((totals.newEnrollments / totals.goal) * 100) : 0}% da meta
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <EnrollmentRing value={total} goal={totals.goal} colorVar={META_RING_COLOR[status]} />
            <div className="text-center">
              <p className="text-sm font-bold text-presentation-foreground">Meta: {totals.goal.toLocaleString("pt-BR")}</p>
              <p className={cn("text-xs font-semibold", META_CAPTION_CLASS[status])}>
                {totals.goal > 0 ? Math.round((total / totals.goal) * 100) : 0}% atingido
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
