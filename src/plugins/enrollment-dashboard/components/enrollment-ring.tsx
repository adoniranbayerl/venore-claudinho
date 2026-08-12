const RADIUS = 50;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const STROKE_WIDTH = 12;

// Anel de um valor só — usado 3x no cabeçalho (rematrícula, nova matrícula, meta), cada um com a
// própria cor e o próprio número, em vez de um donut combinado só. colorVar é sempre
// var(--presentation-*) — nunca chart-6/chart-7 puro, que troca de valor com light/dark (ver
// comentário em theme.css sobre --presentation-renewed/--presentation-new).
export function EnrollmentRing({
  value,
  goal,
  colorVar,
  size = 108,
}: {
  value: number;
  goal: number;
  colorVar: string;
  size?: number;
}) {
  const ratio = goal > 0 ? value / goal : 0;
  const length = Math.min(Math.max(ratio, 0), 1) * CIRCUMFERENCE;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
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
        <span className="text-xl font-extrabold tabular-nums text-presentation-foreground">{value.toLocaleString("pt-BR")}</span>
      </div>
    </div>
  );
}
