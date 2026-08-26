import { cn } from "@/lib/utils";
import { goalStatus, retentionRatio } from "../shared/enrollment-metrics";
import { EnrollmentRing } from "./enrollment-ring";

const RING_COLOR = {
  met: "var(--presentation-success)",
  "on-track": "var(--presentation-warning)",
  below: "var(--presentation-destructive)",
} as const;

const RING_CAPTION_CLASS = {
  met: "text-presentation-success",
  "on-track": "text-presentation-warning",
  below: "text-presentation-destructive",
} as const;

// Um bloco (anel + legenda) por métrica. layout="row" (view resumida) mantém o anel dimensionado
// pela LARGURA do bloco (comportamento original de EnrollmentRing) — a linha inteira já é limitada
// pela altura do slide, não precisa de outro eixo de contenção. layout="column" (view detalhada,
// pedido explícito: "os gráficos não devem exceder o height da view") inverte isso: o anel some
// dentro de um wrapper flex-1/min-h-0 PRÓPRIO (sem a legenda dividindo espaço com ele), então
// h-full nele resolve pra altura de fato disponível — a legenda abaixo (shrink-0) nunca é
// espremida, e o anel nunca estoura a altura da coluna, só a largura quando sobra (max-w-full).
function SummaryRingBlock({
  value,
  goal,
  colorVar,
  size,
  isRow,
  title,
  caption,
  captionClass,
}: {
  value: number;
  goal: number;
  colorVar: string;
  size: "default" | "large";
  isRow: boolean;
  title: string;
  caption: string;
  captionClass: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-2", isRow ? "w-full" : "min-h-0 w-full flex-1")}>
      {isRow ? (
        <EnrollmentRing value={value} goal={goal} colorVar={colorVar} size={size} />
      ) : (
        <div className="min-h-0 w-full flex-1">
          <EnrollmentRing value={value} goal={goal} colorVar={colorVar} size={size} className="mx-auto h-full w-auto max-w-full" />
        </div>
      )}
      <div className="shrink-0 text-center">
        <p className={cn("font-bold text-presentation-foreground", isRow ? "text-xl" : "text-base")}>{title}</p>
        <p className={cn("font-semibold", isRow ? "text-lg" : "text-sm", captionClass)}>{caption}</p>
      </div>
    </div>
  );
}

// Coluna de resumo geral — primeira coluna do grid na view detalhada, ao lado das turmas/cursos
// (pedido explícito: "a coluna dos anéis deve estar ao lado das turmas, como a primeira coluna").
// Na view detalhada ela é só os anéis (pedido explícito: "pode retirar a linha e título, mantenha
// apenas os gráficos" — sem cabeçalho "Geral" nem legenda de cor). Na view resumida também não tem
// mais legenda no header (pedido explícito: "na versão resumida pode tirar a legenda no header") —
// os anéis e as legendas de cada anel (Rematrículas/Novas matrículas/Meta) já se bastam.
//
// layout="row" + size="large" é usado pela view resumida (enrollment-summary-slide.tsx, pedido
// explícito de alternância manual entre as duas views): mesmo conteúdo, só maior e lado a lado em
// vez de empilhado, porque ali não tem coluna de turma/curso disputando espaço.
export function EnrollmentSummaryColumn({
  totals,
  layout = "column",
  size = "default",
}: {
  totals: { goal: number; renewed: number; newEnrollments: number };
  layout?: "column" | "row";
  size?: "default" | "large";
}) {
  const total = totals.renewed + totals.newEnrollments;
  const retention = retentionRatio(totals);
  const status = goalStatus(totals);
  const isRow = layout === "row";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={cn("flex min-h-0 flex-1 items-center gap-6", isRow ? "flex-row justify-center" : "flex-col justify-center")}>
        <SummaryRingBlock
          value={totals.renewed}
          goal={totals.goal}
          colorVar="var(--presentation-renewed)"
          size={size}
          isRow={isRow}
          title="Rematrículas"
          caption={`${Math.round(retention * 100)}% de retenção`}
          captionClass="text-presentation-renewed"
        />

        <SummaryRingBlock
          value={totals.newEnrollments}
          goal={totals.goal}
          colorVar="var(--presentation-new)"
          size={size}
          isRow={isRow}
          title="Novas matrículas"
          caption={`${totals.goal > 0 ? Math.round((totals.newEnrollments / totals.goal) * 100) : 0}% da meta`}
          captionClass="text-presentation-new"
        />

        <SummaryRingBlock
          value={total}
          goal={totals.goal}
          colorVar={RING_COLOR[status]}
          size={size}
          isRow={isRow}
          title={`Meta: ${totals.goal.toLocaleString("pt-BR")}`}
          caption={`${totals.goal > 0 ? Math.round((total / totals.goal) * 100) : 0}% atingido`}
          captionClass={RING_CAPTION_CLASS[status]}
        />
      </div>
    </div>
  );
}
