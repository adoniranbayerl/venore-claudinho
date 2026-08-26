// Cores usadas em todo o slide (anéis, números da tabela, ícone de meta atingida) — pedido
// explícito: "no final da página coloque uma legenda das cores". var(--presentation-*) sempre
// (nunca chart-6/7 puro), mesmo racional de invariância do resto do slide (ver comentário em
// enrollment-ring.tsx): esta faixa não pode trocar de cor com o toggle claro/escuro do admin.
const LEGEND_ITEMS = [
  { colorVar: "var(--presentation-renewed)", label: "Rematrícula" },
  { colorVar: "var(--presentation-new)", label: "Nova matrícula" },
  { colorVar: "var(--presentation-success)", label: "Meta atingida" },
  { colorVar: "var(--presentation-warning)", label: "Em andamento" },
  { colorVar: "var(--presentation-destructive)", label: "Abaixo da meta" },
] as const;

export function EnrollmentColorLegend() {
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-10 gap-y-2 border-t-2 border-presentation-border pt-4 text-lg font-bold text-presentation-muted-foreground">
      {LEGEND_ITEMS.map((item) => (
        <span key={item.label} className="flex items-center gap-2.5 whitespace-nowrap">
          <span className="size-4 shrink-0 rounded-full" style={{ background: item.colorVar }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
