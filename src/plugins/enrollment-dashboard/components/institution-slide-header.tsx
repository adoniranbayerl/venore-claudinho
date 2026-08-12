import type { EnrollmentInstitution } from "../contracts/types";
import { retentionRatio } from "../shared/enrollment-metrics";
import { InstitutionLogo } from "./institution-logo";
import { EnrollmentDonut } from "./enrollment-donut";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

// Cabeçalho compartilhado pelos dois slides de TV (colégio e faculdade) — identidade da
// instituição à esquerda; à direita, a legenda de cor (uma vez só, os cartões abaixo não repetem
// texto), a retenção (rematriculados ÷ total — conta diferente da meta, por isso separada do
// donut) e o donut (meta + composição). Tudo ancorado no topo (items-start), não centralizado —
// o donut é mais alto que o bloco de identidade, e um "center" deixava a identidade flutuando.
// Vocabulário oficial "apresentação" do sistema de temas (superfície sempre escura) + chart-6/
// chart-7 (par categórico) na legenda — nenhuma cor própria do plugin.
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
  const ratio = totals.goal > 0 ? total / totals.goal : 0;
  const retention = retentionRatio(totals);

  return (
    <header className="flex shrink-0 items-start justify-between gap-6">
      <div className="flex items-start gap-4">
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
            <span className="size-2.5 shrink-0 rounded-full bg-chart-6" />
            Rematrícula
          </span>
          <span className="flex items-center gap-2 text-sm font-semibold text-presentation-muted-foreground">
            <span className="size-2.5 shrink-0 rounded-full bg-chart-7" />
            Nova matrícula
          </span>
        </div>

        <div className="flex items-start gap-8">
          <div className="pt-2 text-right">
            <p className="text-3xl font-extrabold tabular-nums text-presentation-foreground">{Math.round(retention * 100)}%</p>
            <p className="text-xs font-bold tracking-wide text-presentation-muted-foreground uppercase">Retenção</p>
          </div>
          <div className="text-center">
            <EnrollmentDonut goal={totals.goal} renewed={totals.renewed} newEnrollments={totals.newEnrollments} />
            <p className="mt-1.5 text-sm font-semibold text-presentation-muted-foreground">{Math.round(ratio * 100)}% da meta</p>
          </div>
        </div>
      </div>
    </header>
  );
}
