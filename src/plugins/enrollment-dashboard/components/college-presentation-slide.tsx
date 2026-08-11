import type { EnrollmentInstitution } from "../contracts/types";
import { sumProgramTotals } from "../shared/enrollment-metrics";
import { InstitutionSlideHeader } from "./institution-slide-header";
import { EnrollmentStatusCard } from "./enrollment-status-card";

// Slide de TV da faculdade — mesmo cartão do colégio (EnrollmentStatusCard), só que "lg": poucos
// cursos, cada um ganha bem mais espaço que uma turma. Sem agrupamento (nenhum program tem
// "group") e sem gráfico à parte — é o mesmo componente que o colégio usa, só o dado muda, como
// pedido ("as views devem ser as mesmas, são os mesmos dados").
export function CollegePresentationSlide({ institution, logoUrl }: { institution: EnrollmentInstitution; logoUrl: string | null }) {
  const totals = sumProgramTotals(institution.programs);

  return (
    <div className="flex h-full flex-col gap-6">
      <InstitutionSlideHeader institution={institution} logoUrl={logoUrl} totals={totals} />
      <div className="grid min-h-0 flex-1 grid-cols-4 items-start gap-5">
        {institution.programs.map((program) => (
          <EnrollmentStatusCard key={program.key} program={program} size="lg" />
        ))}
      </div>
    </div>
  );
}
