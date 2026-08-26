import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminStatTile } from "@/components/admin-stat-tile";
import type { EnrollmentInstitution, EnrollmentProgramMetrics } from "../contracts/types";
import { goalCompletionRatio, sumProgramTotals, totalEnrollments } from "../shared/enrollment-metrics";
import { InstitutionLogo } from "./institution-logo";
import { EnrollmentTable } from "./enrollment-table";
import { GoalVsActualChart, type GoalVsActualDatum } from "./goal-vs-actual-chart";
import { EnrollmentCompositionChart, type EnrollmentCompositionDatum } from "./enrollment-composition-chart";

// Componente 100% apresentacional na leitura (sem fetch próprio), mas os três renderXActions são
// slots opcionais pra quem chama (routes/admin/page.tsx) injetar os botões/diálogos de CRUD sem
// este componente precisar conhecer server actions — mesma separação de EnrollmentTable.
// renderActions vira coluna extra só quando passado; sem eles a view volta a ser só leitura.
export function EnrollmentDashboardView({
  institutions,
  logoUrlByInstitution,
  renderInstitutionActions,
  renderCreateProgramAction,
  renderProgramActions,
  emptyState,
}: {
  institutions: EnrollmentInstitution[];
  logoUrlByInstitution: Map<string, string | null>;
  renderInstitutionActions?: (institution: EnrollmentInstitution) => ReactNode;
  renderCreateProgramAction?: (institution: EnrollmentInstitution) => ReactNode;
  renderProgramActions?: (institution: EnrollmentInstitution, program: EnrollmentProgramMetrics) => ReactNode;
  emptyState?: ReactNode;
}) {
  const overall = sumProgramTotals(institutions.flatMap((institution) => institution.programs));
  const overallTotal = overall.renewed + overall.newEnrollments;
  const overallRatio = overall.goal > 0 ? overallTotal / overall.goal : 0;

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <AdminStatTile label="Meta geral" value={overall.goal.toLocaleString("pt-BR")} />
        <AdminStatTile label="Total matriculado" value={overallTotal.toLocaleString("pt-BR")} />
        <AdminStatTile
          label="% da meta"
          value={`${Math.round(overallRatio * 100)}%`}
          hint={`${overallTotal.toLocaleString("pt-BR")} de ${overall.goal.toLocaleString("pt-BR")}`}
        />
        <AdminStatTile label="Rematriculados" value={overall.renewed.toLocaleString("pt-BR")} />
        <AdminStatTile label="Novas matrículas" value={overall.newEnrollments.toLocaleString("pt-BR")} />
      </section>

      {institutions.length === 0 && emptyState}

      {institutions.map((institution) => {
        const totals = sumProgramTotals(institution.programs);
        const total = totals.renewed + totals.newEnrollments;
        const ratio = goalCompletionRatio({ goal: totals.goal, renewed: totals.renewed, newEnrollments: totals.newEnrollments });

        const goalVsActualData: GoalVsActualDatum[] = institution.programs.map((program) => ({
          key: program.key,
          label: program.label,
          goal: program.goal,
          total: totalEnrollments(program),
        }));
        const compositionData: EnrollmentCompositionDatum[] = institution.programs.map((program) => ({
          key: program.key,
          label: program.label,
          renewed: program.renewed,
          newEnrollments: program.newEnrollments,
        }));

        return (
          <Card key={institution.id}>
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <InstitutionLogo url={logoUrlByInstitution.get(institution.key) ?? null} name={institution.name} />
              <div className="flex-1">
                <CardTitle className="text-lg">{institution.name}</CardTitle>
                <CardDescription>
                  {total.toLocaleString("pt-BR")} matriculados de {totals.goal.toLocaleString("pt-BR")} ({Math.round(ratio * 100)}% da meta)
                </CardDescription>
              </div>
              {renderInstitutionActions && <div className="flex shrink-0 gap-1">{renderInstitutionActions(institution)}</div>}
            </CardHeader>
            <CardContent className="space-y-6">
              {renderCreateProgramAction && <div className="flex justify-end">{renderCreateProgramAction(institution)}</div>}

              {institution.programs.length === 0 ? (
                <p className="rounded-panel border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Nenhum{institution.programLabel.toLowerCase().endsWith("a") ? "a" : ""} {institution.programLabel.toLowerCase()} cadastrad
                  {institution.programLabel.toLowerCase().endsWith("a") ? "a" : "o"} ainda.
                </p>
              ) : (
                <>
                  <div className="overflow-hidden rounded-panel border border-border">
                    <EnrollmentTable
                      programs={institution.programs}
                      programLabel={institution.programLabel}
                      renderActions={renderProgramActions ? (program) => renderProgramActions(institution, program) : undefined}
                    />
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-foreground">Meta x total por {institution.programLabel.toLowerCase()}</h3>
                      <GoalVsActualChart data={goalVsActualData} />
                    </div>
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-foreground">Composição da matrícula por {institution.programLabel.toLowerCase()}</h3>
                      <EnrollmentCompositionChart data={compositionData} />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
