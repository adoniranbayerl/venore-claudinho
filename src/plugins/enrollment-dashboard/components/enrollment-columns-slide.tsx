import type { EnrollmentInstitution, EnrollmentProgramMetrics } from "../contracts/types";
import { retentionRatio, sumProgramTotals } from "../shared/enrollment-metrics";
import { InstitutionSlideHeader } from "./institution-slide-header";
import { EnrollmentSummaryColumn } from "./enrollment-summary-column";
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

// Slide de TV — mesmo layout pras duas instituições, turma/curso em colunas fixas, cada um uma
// linha de lista (EnrollmentRowItem). A primeira coluna é sempre o resumo geral em anéis
// (EnrollmentSummaryColumn, pedido explícito: "a coluna dos anéis deve estar ao lado das turmas,
// como a primeira coluna"), seguida pelas colunas de turma/curso. Colégio tem "group" em cada
// program (segmento: Educação Infantil, Fundamental I/II, Médio) e vira 4 colunas de turma;
// faculdade não tem "group" nenhum, cai num único grupo (rótulo = programLabel no plural:
// "Cursos") e vira 1 coluna larga com os 4 cursos — total de 2 e 5 colunas respectivamente.
export function EnrollmentColumnsSlide({ institution, logoUrl }: { institution: EnrollmentInstitution; logoUrl: string | null }) {
  const totals = sumProgramTotals(institution.programs);
  const groups = groupPrograms(institution.programs, `${institution.programLabel}s`);

  return (
    <div className="flex h-full flex-col gap-8">
      <InstitutionSlideHeader institution={institution} logoUrl={logoUrl} />

      <div className="grid min-h-0 flex-1 gap-10" style={{ gridTemplateColumns: `repeat(${groups.length + 1}, minmax(0, 1fr))` }}>
        <EnrollmentSummaryColumn totals={totals} />

        {groups.map(({ group, programs }) => {
          const groupTotals = sumProgramTotals(programs);
          const groupRetention = retentionRatio(groupTotals);

          return (
            <div key={group} className="flex min-h-0 flex-col">
              <div className="mb-4 min-h-16 border-b-2 border-presentation-border pb-3">
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
