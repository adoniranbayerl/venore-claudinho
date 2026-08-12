const RADIUS = 50;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const STROKE_WIDTH = 13;

// Anel só (sem chart lib) — mesma técnica de stroke-dasharray/dashoffset em dois <circle>
// sobrepostos que layer-renderer.tsx/course-dashboard-chart-client.tsx já usam pra cor via
// var(...) em atributo SVG. Track e texto usam o vocabulário oficial "apresentação" (superfície
// sempre escura, ver theme.css); o preenchimento usa chart-6/chart-7 (mesmo par categórico dos
// cartões) — vai até o ponto da meta (sobra de anel = quanto falta), dividido em rematrícula x
// nova dentro do que já foi preenchido.
export function EnrollmentDonut({
  goal,
  renewed,
  newEnrollments,
  size = 128,
}: {
  goal: number;
  renewed: number;
  newEnrollments: number;
  size?: number;
}) {
  const total = renewed + newEnrollments;
  const denom = Math.max(goal, total, 1);
  const renewedLength = (renewed / denom) * CIRCUMFERENCE;
  const newLength = (newEnrollments / denom) * CIRCUMFERENCE;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="h-full w-full">
        <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="var(--presentation-border)" strokeWidth={STROKE_WIDTH} />
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          stroke="var(--chart-6)"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={`${renewedLength} ${CIRCUMFERENCE}`}
          transform="rotate(-90 60 60)"
        />
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          stroke="var(--chart-7)"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={`${newLength} ${CIRCUMFERENCE}`}
          strokeDashoffset={-renewedLength}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
        <span className="text-2xl font-extrabold tabular-nums text-presentation-foreground">{total.toLocaleString("pt-BR")}</span>
        <span className="mt-1 text-xs font-semibold text-presentation-muted-foreground">de {goal.toLocaleString("pt-BR")}</span>
      </div>
    </div>
  );
}
