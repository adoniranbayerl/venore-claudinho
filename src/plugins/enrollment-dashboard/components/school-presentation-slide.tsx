import type { EnrollmentInstitution, EnrollmentProgramMetrics } from "../contracts/types";
import { retentionRatio, sumProgramTotals } from "../shared/enrollment-metrics";
import { InstitutionSlideHeader } from "./institution-slide-header";
import { EnrollmentStatusCard } from "./enrollment-status-card";

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

// Slide de TV do colégio — turma agrupada por segmento em colunas fixas (Educação Infantil,
// Fundamental I, Fundamental II, Ensino Médio), cada uma ancorada no topo (justify-start): antes
// as colunas com menos turmas (Educação Infantil) centralizavam o conteúdo verticalmente e
// ficavam fora de linha com as colunas mais cheias — agora todas começam na mesma linha, sobra de
// espaço (se houver) fica embaixo.
export function SchoolPresentationSlide({ institution, logoUrl }: { institution: EnrollmentInstitution; logoUrl: string | null }) {
  const totals = sumProgramTotals(institution.programs);
  const groups = groupPrograms(institution.programs);

  return (
    <div className="flex h-full flex-col gap-5">
      <InstitutionSlideHeader institution={institution} logoUrl={logoUrl} totals={totals} />

      <div className="grid min-h-0 flex-1 gap-4" style={{ gridTemplateColumns: `repeat(${groups.length}, minmax(0, 1fr))` }}>
        {groups.map(({ group, programs }) => {
          const groupRetention = retentionRatio(sumProgramTotals(programs));

          return (
            <div key={group} className="flex min-h-0 flex-col">
              <div className="mb-2.5 flex items-baseline justify-between gap-2">
                <h2 className="truncate text-xs font-bold tracking-caps text-foreground uppercase">{group}</h2>
                <span className="shrink-0 text-xs font-bold tabular-nums text-muted-foreground">{Math.round(groupRetention * 100)}% ret.</span>
              </div>
              <div className="flex flex-1 flex-col justify-start gap-2">
                {programs.map((program) => (
                  <EnrollmentStatusCard key={program.key} program={program} size="sm" />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
