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
    <header className="flex shrink-0 items-start justify-between gap-5">
      <div className="flex items-start gap-4">
        <InstitutionLogo
          url={logoUrl}
          name={institution.name}
          className="size-14 border-presentation-border bg-presentation-card text-presentation-muted-foreground"
        />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-presentation-foreground">{institution.name}</h1>
          <p className="text-sm text-presentation-faint-foreground">{dateFormatter.format(new Date())}</p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-3.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-presentation-muted-foreground">
            <span className="size-2 shrink-0 rounded-full bg-presentation-renewed" />
            Rematrícula
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-presentation-muted-foreground">
            <span className="size-2 shrink-0 rounded-full bg-presentation-new" />
            Nova matrícula
          </span>
        </div>

        <div className="flex items-start gap-6">
          <div className="pt-1.5 text-right">
            <p className="text-2xl font-extrabold tabular-nums text-presentation-renewed">{Math.round(retention * 100)}%</p>
            <p className="text-[0.68rem] font-bold tracking-wide text-presentation-faint-foreground uppercase">Retenção</p>
          </div>
          <div className="text-center">
            <EnrollmentDonut goal={totals.goal} renewed={totals.renewed} newEnrollments={totals.newEnrollments} />
            <p className="mt-1 text-xs font-semibold text-presentation-muted-foreground">{Math.round(ratio * 100)}% da meta</p>
          </div>
        </div>
      </div>
    </header>
  );
}
