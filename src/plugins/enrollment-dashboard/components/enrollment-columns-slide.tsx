import { cn } from "@/lib/utils";
import type { EnrollmentInstitution, EnrollmentProgramMetrics } from "../contracts/types";
import { retentionRatio, sumProgramTotals } from "../shared/enrollment-metrics";
import { resolveEnrollmentRowDensity, type EnrollmentRowDensity } from "../shared/enrollment-density";
import { InstitutionSlideHeader } from "./institution-slide-header";
import { EnrollmentSummaryColumn } from "./enrollment-summary-column";
import { EnrollmentProgramsTable } from "./enrollment-programs-table";
import { EnrollmentColorLegend } from "./enrollment-color-legend";
import { EnrollmentFitScale } from "./enrollment-fit-scale";

// Program sem "group" (pedido explícito: "no lugar de uma coluna chamada Cursos, coloca uma
// coluna por curso") vira coluna própria — chave é sempre o id (nunca o label, que dois programs
// homônimos poderiam repetir), mas o rótulo exibido no cabeçalho da coluna é o do program.
function groupPrograms(
  programs: EnrollmentProgramMetrics[],
): { key: string; label: string; programs: EnrollmentProgramMetrics[] }[] {
  const order: string[] = [];
  const byGroup = new Map<string, { label: string; programs: EnrollmentProgramMetrics[] }>();
  for (const program of programs) {
    const key = program.group ?? program.id;
    if (!byGroup.has(key)) {
      order.push(key);
      byGroup.set(key, { label: program.group ?? program.label, programs: [] });
    }
    byGroup.get(key)?.programs.push(program);
  }
  return order.map((key) => ({ key, label: byGroup.get(key)!.label, programs: byGroup.get(key)!.programs }));
}

// Cabeçalho de coluna virou card (pedido explícito: "o nome das colunas se tornam cards") — caixa
// com fundo próprio (bg-presentation-card, pedido explícito: "cards de colunas coloridos, com bg"
// — superfície elevada já oficializada no tema, ver theme.css, não uma cor nova) em vez de só texto
// + traço embaixo. Título maior (pedido explícito: "aumente o tamanho das informações") e sem
// tracking-caps (pedido explícito: "remova o spacing entre letras do título" — tracking-caps é o
// letter-spacing usado nos outros rótulos maiúsculos do slide). Ainda encolhe com a densidade
// (shared/enrollment-density.ts, decidida pela CONTAGEM de turmas/cursos), independente da escala
// de correção de viewport do EnrollmentFitScale (decidida pela CAIXA disponível) — os dois eixos
// são ortogonais, ver comentário em enrollment-fit-scale.tsx.
const CARD_HEADER_STYLES: Record<EnrollmentRowDensity, { padding: string; title: string; stat: string }> = {
  comfortable: { padding: "px-5 py-4", title: "text-3xl", stat: "text-lg" },
  compact: { padding: "px-4 py-3.5", title: "text-2xl", stat: "text-base" },
  dense: { padding: "px-3 py-2.5", title: "text-xl", stat: "text-sm" },
};

// Slide de TV — mesmo layout pras duas instituições. A primeira coluna é sempre o resumo geral em
// anéis (EnrollmentSummaryColumn, pedido explícito: "a coluna dos anéis deve estar ao lado das
// turmas, como a primeira coluna"), seguida pelas colunas de turma/curso — cada uma um card com o
// nome do segmento (pedido explícito) e, dentro dele, uma tabela com uma linha por turma/curso
// (pedido explícito: "as turmas se tornam linhas de tabela" — ver enrollment-programs-table.tsx).
// Colégio tem "group" em cada program (segmento: Educação Infantil, Fundamental I/II, Médio) e vira
// 4 cards/tabelas; faculdade não tem "group" em nenhum program, então cada curso vira seu próprio
// card/tabela de uma linha só (pedido explícito: "no lugar de uma coluna chamada Cursos, coloca uma
// coluna por curso").
//
// Legenda de cores (pedido explícito: "no final da página coloque uma legenda das cores") fecha o
// slide, fora da linha aside+grid — shrink-0, largura cheia, sempre a última coisa embaixo.
//
// As colunas de turma/curso (não o aside — esse já é proporcional/height-driven, ver
// enrollment-summary-column.tsx) renderizam em flex-row de largura NATURAL (w-max em cada coluna,
// sem truncate/line-clamp/table-fixed forçando texto a caber numa largura fixa) dentro de um
// EnrollmentFitScale: a densidade decide o tamanho "certo" pros dados (linhas/fonte), e o
// FitScale corrige por cima quando mesmo assim o resultado não cabe na caixa REAL disponível —
// escalando tudo junto, nunca cortando uma palavra no meio (achado real e repetido: este slide
// embutido como camada "webpage" do Broadcast Studio, com agenda+footer abertos, roda numa caixa
// mais estreita/mais baixa que 16:9, com dimensão que varia por configuração e não dá pra prever
// de antemão — ver enrollment-fit-scale.tsx).
export function EnrollmentColumnsSlide({ institution, logoUrl }: { institution: EnrollmentInstitution; logoUrl: string | null }) {
  const totals = sumProgramTotals(institution.programs);
  const groups = groupPrograms(institution.programs);
  const maxProgramsInAnyGroup = Math.max(0, ...groups.map((g) => g.programs.length));
  const density = resolveEnrollmentRowDensity(maxProgramsInAnyGroup);
  const cardStyles = CARD_HEADER_STYLES[density];

  return (
    <div className="flex h-full flex-col gap-5">
      <InstitutionSlideHeader institution={institution} logoUrl={logoUrl} />

      <div className="flex min-h-0 flex-1 gap-10">
        {/* Largura PROPORCIONAL, não em px/rem fixo (pedido explícito: "os gráficos devem ficar
            alinhados SEMPRE à esquerda da página, quase como uma moldura") — basis-1/5 (sempre 20%
            da largura da linha) mantém o painel como um "quadro" estável de posição e proporção
            consistentes em QUALQUER largura de canvas. Os anéis dele já são height-driven (ver
            enrollment-summary-column.tsx), então não precisam do FitScale abaixo. */}
        <aside className="flex basis-1/5 shrink-0 flex-col border-r-2 border-presentation-border pr-10">
          <EnrollmentSummaryColumn totals={totals} />
        </aside>

        {/* min-w-0 é essencial aqui (não só min-h-0) — sem ele, este item flex (eixo principal
            horizontal, já que a linha pai é flex-row) usa a largura MÍNIMA automática baseada no
            conteúdo (default: min-width:auto), que herda a largura natural do EnrollmentFitScale
            lá dentro (propositalmente "grande demais" — ver comentário nele) e NUNCA encolhe pra
            caber na fatia real da linha, quebrando a própria medição do FitScale (achado real: o
            "outer" media a si mesmo já esticado pelo conteúdo, então nunca detectava overflow). */}
        <div className="min-h-0 min-w-0 flex-1">
          <EnrollmentFitScale>
            <div className="flex w-max gap-8">
              {groups.map(({ key, label, programs }) => {
                const groupTotals = sumProgramTotals(programs);
                const groupRetention = retentionRatio(groupTotals);

                return (
                  <div key={key} className="flex w-max shrink-0 flex-col gap-3">
                    <div className={cn("shrink-0 rounded-2xl bg-presentation-card", cardStyles.padding)}>
                      <div className="flex items-baseline justify-between gap-3">
                        {/* whitespace-nowrap (não line-clamp/truncate) — o título nunca quebra
                            nem corta; se não couber na caixa real, é o slide inteiro que encolhe
                            (EnrollmentFitScale), nunca uma palavra cortada no meio. */}
                        <h2 className={cn("whitespace-nowrap font-extrabold leading-tight text-presentation-foreground uppercase", cardStyles.title)}>
                          {label}
                        </h2>
                        <span className={cn("shrink-0 whitespace-nowrap font-extrabold tabular-nums text-presentation-renewed", cardStyles.stat)}>
                          {Math.round(groupRetention * 100)}% ret.
                        </span>
                      </div>
                      <div className={cn("mt-1.5 flex items-center gap-4 font-bold tabular-nums", cardStyles.stat)}>
                        <span className="whitespace-nowrap text-presentation-renewed">{groupTotals.renewed.toLocaleString("pt-BR")} rematr.</span>
                        <span className="whitespace-nowrap text-presentation-new">{groupTotals.newEnrollments.toLocaleString("pt-BR")} novas</span>
                        <span className="ml-auto whitespace-nowrap text-presentation-muted-foreground">
                          Meta {groupTotals.goal.toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>

                    <EnrollmentProgramsTable programs={programs} density={density} />
                  </div>
                );
              })}
            </div>
          </EnrollmentFitScale>
        </div>
      </div>

      <EnrollmentColorLegend />
    </div>
  );
}
