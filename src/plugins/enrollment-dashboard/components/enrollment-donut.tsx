const RADIUS = 50;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const STROKE_WIDTH = 13;

// Anel só (sem chart lib) — mesma técnica de stroke-dasharray/dashoffset em dois <circle>
// sobrepostos que layer-renderer.tsx/course-dashboard-chart-client.tsx já usam pra cor via
// var(...) em atributo SVG (aqui var(--border)/var(--muted-foreground)/var(--primary), tokens já
// existentes no tema — plugin não declara cor nova). O preenchimento vai até o ponto da meta
// (sobra de anel = quanto falta); dentro do preenchido, duas cores marcam rematrícula x nova —
// mesma leitura da barra do EnrollmentStatusCard, só que em formato de "hero" pro cabeçalho.
export function EnrollmentDonut({
  goal,
  renewed,
  newEnrollments,
  size = 104,
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
        <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="var(--border)" strokeWidth={STROKE_WIDTH} />
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          stroke="var(--muted-foreground)"
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
          stroke="var(--primary)"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={`${newLength} ${CIRCUMFERENCE}`}
          strokeDashoffset={-renewedLength}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
        <span className="text-lg font-extrabold tabular-nums text-foreground">{total.toLocaleString("pt-BR")}</span>
        <span className="mt-1 text-[0.6rem] font-semibold text-muted-foreground/56">de {goal.toLocaleString("pt-BR")}</span>
      </div>
    </div>
  );
}
