import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { EnrollmentInstitution } from "../contracts/types";
import { goalCompletionRatio, sumProgramTotals, totalEnrollments } from "../shared/enrollment-metrics";
import { StatTile } from "./stat-tile";
import { InstitutionLogo } from "./institution-logo";
import { EnrollmentTable } from "./enrollment-table";
import { GoalVsActualChart, type GoalVsActualDatum } from "./goal-vs-actual-chart";
import { EnrollmentCompositionChart, type EnrollmentCompositionDatum } from "./enrollment-composition-chart";

// Componente 100% apresentacional (sem fetch próprio) — recebe o dado já resolvido (mock hoje,
// service.ts real depois) e a URL dos logos já resolvida via getMediaAsset. Isso permite as duas
// páginas que o usam (admin, com shell/gate de sessão, e a view pública de apresentação, sem
// shell/sem sessão) compartilharem o mesmo miolo sem duplicar JSX.
export function EnrollmentDashboardView({
  institutions,
  logoUrlByInstitution,
}: {
  institutions: EnrollmentInstitution[];
  logoUrlByInstitution: Map<string, string | null>;
}) {
  const overall = sumProgramTotals(institutions.flatMap((institution) => institution.programs));
  const overallTotal = overall.renewed + overall.newEnrollments;
  const overallRatio = overall.goal > 0 ? overallTotal / overall.goal : 0;

  const fidelis = institutions.find((institution) => institution.key === "fidelis");
  const goalVsActualData: GoalVsActualDatum[] = (fidelis?.programs ?? []).map((program) => ({
    key: program.key,
    label: program.label,
    goal: program.goal,
    total: totalEnrollments(program),
  }));
  const compositionData: EnrollmentCompositionDatum[] = (fidelis?.programs ?? []).map((program) => ({
    key: program.key,
    label: program.label,
    renewed: program.renewed,
    newEnrollments: program.newEnrollments,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Dashboard de Matrícula</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Meta, rematrícula e novas matrículas por instituição e curso. Dado mockado — próxima etapa é ligar à matrícula real.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile label="Meta geral" value={overall.goal.toLocaleString("pt-BR")} />
        <StatTile label="Total matriculado" value={overallTotal.toLocaleString("pt-BR")} />
        <StatTile
          label="% da meta"
          value={`${Math.round(overallRatio * 100)}%`}
          hint={`${overallTotal.toLocaleString("pt-BR")} de ${overall.goal.toLocaleString("pt-BR")}`}
        />
        <StatTile label="Rematriculados" value={overall.renewed.toLocaleString("pt-BR")} />
        <StatTile label="Novas matrículas" value={overall.newEnrollments.toLocaleString("pt-BR")} />
      </section>

      {institutions.map((institution) => {
        const totals = sumProgramTotals(institution.programs);
        const total = totals.renewed + totals.newEnrollments;
        const ratio = goalCompletionRatio({ goal: totals.goal, renewed: totals.renewed, newEnrollments: totals.newEnrollments });

        return (
          <Card key={institution.key}>
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <InstitutionLogo url={logoUrlByInstitution.get(institution.key) ?? null} name={institution.name} />
              <div>
                <CardTitle className="text-lg">{institution.name}</CardTitle>
                <CardDescription>
                  {total.toLocaleString("pt-BR")} matriculados de {totals.goal.toLocaleString("pt-BR")} ({Math.round(ratio * 100)}% da meta)
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="overflow-hidden rounded-panel border border-border">
                <EnrollmentTable programs={institution.programs} programLabel={institution.programLabel} />
              </div>

              {institution.key === "fidelis" && (
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-foreground">Meta x total por curso</h3>
                    <GoalVsActualChart data={goalVsActualData} />
                  </div>
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-foreground">Composição da matrícula por curso</h3>
                    <EnrollmentCompositionChart data={compositionData} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
