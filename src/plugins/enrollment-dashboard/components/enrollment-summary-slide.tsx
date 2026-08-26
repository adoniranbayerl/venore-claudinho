import type { EnrollmentInstitution } from "../contracts/types";
import { sumProgramTotals } from "../shared/enrollment-metrics";
import { InstitutionSlideHeader } from "./institution-slide-header";
import { EnrollmentSummaryColumn } from "./enrollment-summary-column";

// View "resumida" (pedido explícito: alternância manual entre resumida/detalhada, ver
// copy-presentation-link-button.tsx e present/page.tsx) — só o total geral em anéis, sem quebra
// por turma/curso. Mesmo header do slide detalhado; o corpo é EnrollmentSummaryColumn em
// layout="row"/size="large" (em vez da coluna estreita de enrollment-columns-slide.tsx), já que
// aqui ela não disputa espaço com nenhuma coluna de turma/curso.
export function EnrollmentSummarySlide({ institution, logoUrl }: { institution: EnrollmentInstitution; logoUrl: string | null }) {
  const totals = sumProgramTotals(institution.programs);

  return (
    <div className="flex h-full flex-col gap-8">
      <InstitutionSlideHeader institution={institution} logoUrl={logoUrl} />

      <div className="flex min-h-0 flex-1 items-center justify-center">
        <EnrollmentSummaryColumn totals={totals} layout="row" size="large" />
      </div>
    </div>
  );
}
