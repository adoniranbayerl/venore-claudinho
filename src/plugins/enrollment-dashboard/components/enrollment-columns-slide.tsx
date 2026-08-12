import type { EnrollmentInstitution, EnrollmentProgramMetrics } from "../contracts/types";
import { retentionRatio, sumProgramTotals } from "../shared/enrollment-metrics";
import { InstitutionSlideHeader } from "./institution-slide-header";
import { EnrollmentRowItem } from "./enrollment-row-item";

function groupPrograms(
  programs: EnrollmentProgramMetrics[],
  fallbackLabel: string,
): { group: string; programs: EnrollmentProgramMetrics[] }[] {
  const order: string[] = [];
  const byGroup = new Map<string, EnrollmentProgramMetrics[]>();
  for (const program of programs) {
    const group = program.group ?? fallbackLabel;
    if (!byGroup.has(group)) {
      order.push(group);
      byGroup.set(group, []);
    }
    byGroup.get(group)?.push(program);
  }
  return order.map((group) => ({ group, programs: byGroup.get(group) ?? [] }));
}

// Slide de TV — mesmo layout pras duas instituições (pedido explícito: "a view da Faculdade deve
// ter o mesmo layout da view do Colégio"), turma/curso em colunas fixas, cada um uma linha de
// lista (EnrollmentRowItem). Colégio tem "group" em cada program (segmento: Educação Infantil,
// Fundamental I/II, Médio) e vira 4 colunas; faculdade não tem "group" nenhum, então cai num único
// grupo (rótulo = programLabel no plural: "Cursos") e vira 1 coluna larga com os 4 cursos.
export function EnrollmentColumnsSlide({ institution, logoUrl }: { institution: EnrollmentInstitution; logoUrl: string | null }) {
  const totals = sumProgramTotals(institution.programs);
  const groups = groupPrograms(institution.programs, `${institution.programLabel}s`);

  return (
    <div className="flex h-full flex-col gap-8">
      <InstitutionSlideHeader institution={institution} logoUrl={logoUrl} totals={totals} />

      <div className="grid min-h-0 flex-1 gap-10" style={{ gridTemplateColumns: `repeat(${groups.length}, minmax(0, 1fr))` }}>
        {groups.map(({ group, programs }) => {
          const groupTotals = sumProgramTotals(programs);
          const groupRetention = retentionRatio(groupTotals);

          return (
            <div key={group} className="flex min-h-0 flex-col">
              <div className="mb-4 border-b-2 border-presentation-border pb-3">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="truncate text-base font-extrabold tracking-caps text-presentation-foreground uppercase">{group}</h2>
                  <span className="shrink-0 text-sm font-extrabold tabular-nums text-presentation-renewed">{Math.round(groupRetention * 100)}% ret.</span>
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm font-bold tabular-nums">
                  <span className="text-presentation-renewed">{groupTotals.renewed.toLocaleString("pt-BR")} rematr.</span>
                  <span className="text-presentation-new">{groupTotals.newEnrollments.toLocaleString("pt-BR")} novas</span>
                  <span className="ml-auto text-presentation-muted-foreground">Meta {groupTotals.goal.toLocaleString("pt-BR")}</span>
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-start">
                {programs.map((program) => (
                  <EnrollmentRowItem key={program.key} program={program} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
