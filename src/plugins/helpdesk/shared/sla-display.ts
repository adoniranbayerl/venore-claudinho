import type { SlaState, TicketPriority } from "../contracts/types";

// Rótulos de prioridade (§2.4) — pt-BR, usados no drawer, no app do técnico e no sla-editor.
export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Baixa",
  normal: "Normal",
  high: "Alta",
  urgent: "Urgente",
};

// Minutos → texto curto ("1h30", "45min", "2d") para o sla-editor e as listas.
export function formatSlaMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  if (minutes % (60 * 24) === 0) return `${minutes / (60 * 24)}d`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h${String(rest).padStart(2, "0")}`;
}

// Apresentação do estado de SLA (docs/chamados-plugin.md §5) — só token semântico shadcn/próprio,
// nunca cor crua. `text-warning` é o único token semântico próprio que sobrevive à migração de
// cores (AGENTS.md §3/§10.1). Usado na tabela e no drawer do admin, no app do técnico e no painel
// de TV (Fase 6). `none`/`ok` não recebem realce.
export const SLA_STATE_TEXT_CLASS: Record<SlaState, string> = {
  none: "text-muted-foreground",
  ok: "text-muted-foreground",
  at_risk: "text-warning",
  breached: "text-destructive",
};

export const SLA_STATE_LABEL: Record<SlaState, string> = {
  none: "Sem SLA",
  ok: "No prazo",
  at_risk: "SLA em risco",
  breached: "SLA estourado",
};

// Rótulo curto para chips/badges compactos (painel de TV, lista mobile).
export const SLA_STATE_SHORT_LABEL: Record<SlaState, string> = {
  none: "—",
  ok: "no prazo",
  at_risk: "em risco",
  breached: "estourado",
};

// Só os estados que a UI de fato realça.
export function isSlaHighlighted(state: SlaState): boolean {
  return state === "at_risk" || state === "breached";
}
