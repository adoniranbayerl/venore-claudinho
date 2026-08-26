import { cn } from "@/lib/utils";

const RADIUS = 50;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const STROKE_WIDTH = 12;

const SIZE_CLASS = {
  default: { wrapper: "max-w-64", figure: "text-3xl" },
  large: { wrapper: "max-w-[26rem]", figure: "text-6xl" },
} as const;

// Anel de um valor só — usado 3x na coluna de resumo (rematrícula, nova matrícula, meta), cada um
// com a própria cor e o próprio número. colorVar é sempre var(--presentation-*) — nunca chart-6/
// chart-7 puro, que troca de valor com light/dark (ver comentário em theme.css sobre
// --presentation-renewed/--presentation-new).
//
// Tamanho proporcional ao espaço disponível (pedido explícito), não um px fixo: w-full/aspect-
// square faz o anel crescer até o limite do próprio container (a coluna de resumo tem larguras
// bem diferentes — 1/2 da tela na faculdade, 1/5 no colégio — um valor fixo ficava minúsculo num
// caso e nem cabia no outro). O SVG usa viewBox, então a espessura do traço acompanha o tamanho
// renderizado automaticamente, sem precisar recalcular STROKE_WIDTH. size="large" é usado só pela
// view resumida (enrollment-summary-slide.tsx), que não disputa espaço com nenhuma coluna de
// turma/curso.
export function EnrollmentRing({
  value,
  goal,
  colorVar,
  size = "default",
  className,
}: {
  value: number;
  goal: number;
  colorVar: string;
  size?: "default" | "large";
  className?: string;
}) {
  const ratio = goal > 0 ? value / goal : 0;
  const length = Math.min(Math.max(ratio, 0), 1) * CIRCUMFERENCE;
  const sizeClass = SIZE_CLASS[size];

  return (
    <div className={cn("relative aspect-square w-full shrink-0", sizeClass.wrapper, className)}>
      <svg viewBox="0 0 120 120" className="h-full w-full">
        <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="var(--presentation-border)" strokeWidth={STROKE_WIDTH} />
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          stroke={colorVar}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={`${length} ${CIRCUMFERENCE}`}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("font-extrabold tabular-nums text-presentation-foreground", sizeClass.figure)}>
          {value.toLocaleString("pt-BR")}
        </span>
      </div>
    </div>
  );
}
