import type { EnrollmentInstitution } from "../contracts/types";
import { sumProgramTotals } from "../shared/enrollment-metrics";
import { InstitutionSlideHeader } from "./institution-slide-header";
import { EnrollmentStatusCard } from "./enrollment-status-card";

// Slide de TV da faculdade — cartão grande por curso (poucos itens, cabe folgado). Sem
// agrupamento (nenhum program tem "group") e sem gráfico à parte — mesma leitura de dado do
// colégio (nome, total/meta, status, composição), só o "recipiente" muda com a densidade
// (EnrollmentRowItem lá, EnrollmentStatusCard aqui).
export function CollegePresentationSlide({ institution, logoUrl }: { institution: EnrollmentInstitution; logoUrl: string | null }) {
  const totals = sumProgramTotals(institution.programs);

  return (
    <div className="flex h-full flex-col gap-8">
      <InstitutionSlideHeader institution={institution} logoUrl={logoUrl} totals={totals} />
      <div className="grid min-h-0 flex-1 grid-cols-4 items-start gap-6">
        {institution.programs.map((program) => (
          <EnrollmentStatusCard key={program.key} program={program} />
        ))}
      </div>
    </div>
  );
}
