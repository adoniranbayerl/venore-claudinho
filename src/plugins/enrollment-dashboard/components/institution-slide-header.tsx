import type { EnrollmentInstitution } from "../contracts/types";
import { InstitutionLogo } from "./institution-logo";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

// Cabeçalho compartilhado pelos slides de TV — pedido explícito: só logo e data de atualização da
// lista, nada de estatística agregada aqui. Os números (rematrícula/nova/meta) já aparecem em
// cada coluna abaixo (EnrollmentColumnsSlide) — repetir tudo de novo no topo, com donuts, virou
// duplicação depois que a coluna passou a mostrar os mesmos três valores.
export function InstitutionSlideHeader({ institution, logoUrl }: { institution: EnrollmentInstitution; logoUrl: string | null }) {
  return (
    <header className="flex shrink-0 items-center gap-5">
      <InstitutionLogo
        url={logoUrl}
        name={institution.name}
        className="size-16 border-presentation-border bg-presentation-card text-presentation-muted-foreground"
      />
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-presentation-foreground">{institution.name}</h1>
        <p className="text-base text-presentation-muted-foreground">Atualizado em {dateFormatter.format(new Date())}</p>
      </div>
    </header>
  );
}
