import type { EnrollmentInstitution } from "../contracts/types";
import { InstitutionLogo } from "./institution-logo";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

// Cabeçalho compartilhado pelos slides de TV — só logo (sem caixa, tamanho normal) e data de
// atualização. O resumo geral em anéis não mora mais aqui — virou a primeira coluna do corpo
// (EnrollmentSummaryColumn), lado a lado com as colunas de turma/curso (pedido explícito: "a
// coluna dos anéis deve estar ao lado das turmas, como a primeira coluna").
export function InstitutionSlideHeader({ institution, logoUrl }: { institution: EnrollmentInstitution; logoUrl: string | null }) {
  return (
    <header className="flex shrink-0 items-center gap-4">
      <InstitutionLogo url={logoUrl} name={institution.name} className="h-20 w-auto" />
      <p className="text-base text-presentation-muted-foreground">Atualizado em {dateFormatter.format(new Date())}</p>
    </header>
  );
}
