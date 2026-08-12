import type { EnrollmentInstitution, EnrollmentProgramMetrics } from "../contracts/types";
import { retentionRatio, sumProgramTotals } from "../shared/enrollment-metrics";
import { InstitutionSlideHeader } from "./institution-slide-header";
import { EnrollmentRowItem } from "./enrollment-row-item";

function groupPrograms(programs: EnrollmentProgramMetrics[]): { group: string; programs: EnrollmentProgramMetrics[] }[] {
  const order: string[] = [];
  const byGroup = new Map<string, EnrollmentProgramMetrics[]>();
  for (const program of programs) {
    const group = program.group ?? "Turmas";
    if (!byGroup.has(group)) {
      order.push(group);
      byGroup.set(group, []);
    }
    byGroup.get(group)?.push(program);
  }
  return order.map((group) => ({ group, programs: byGroup.get(group) ?? [] }));
}

// Slide de TV do colégio — turma agrupada por segmento em colunas fixas, cada turma uma linha de
// lista (EnrollmentRowItem), não um cartão com fundo/borda próprios: 16 caixas coloridas lado a
// lado ficavam "poluídas"; uma lista com traço fino entre linhas lê mais limpo e sobra bem mais
// espaço vertical por turma. Colunas ancoradas no topo (justify-start).
export function SchoolPresentationSlide({ institution, logoUrl }: { institution: EnrollmentInstitution; logoUrl: string | null }) {
  const totals = sumProgramTotals(institution.programs);
  const groups = groupPrograms(institution.programs);

  return (
    <div className="flex h-full flex-col gap-8">
      <InstitutionSlideHeader institution={institution} logoUrl={logoUrl} totals={totals} />

      <div className="grid min-h-0 flex-1 gap-10" style={{ gridTemplateColumns: `repeat(${groups.length}, minmax(0, 1fr))` }}>
        {groups.map(({ group, programs }) => {
          const groupRetention = retentionRatio(sumProgramTotals(programs));

          return (
            <div key={group} className="flex min-h-0 flex-col">
              <div className="mb-3 flex items-baseline justify-between gap-2 border-b-2 border-presentation-border pb-3">
                <h2 className="truncate text-base font-extrabold tracking-caps text-presentation-foreground uppercase">{group}</h2>
                <span className="shrink-0 text-sm font-extrabold tabular-nums text-presentation-renewed">{Math.round(groupRetention * 100)}%</span>
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
