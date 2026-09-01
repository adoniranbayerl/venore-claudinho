import type { SlaState, TicketPriority } from "../contracts/types";

// Cálculo de SLA do chamado (docs/chamados-plugin.md §2.4, §5). Puro e sem I/O — coberto por
// teste unitário. v1: HORAS CORRIDAS (24/7); pausa em "aguardando" e horário comercial são Fase 8.
//
// - `slaDueAt(startedAt, resolutionMinutes)` — o prazo de resolução: instante da abertura (ou do
//   último priority_change) + os minutos da política. O service persiste isso em
//   `tickets.sla_due_at`.
// - `slaBreached` — prazo estourado e o chamado ainda não resolvido (§5: `sla_due_at < now &&
//   resolved_at == null`).
// - `slaAtRisk` — passou de 80 % do prazo (§2.4) sem resolver, mas ainda não estourou.
// - `slaState` — o rótulo único que a UI pinta (via shared/sla-display.ts).

// Padrão quando a fila não tem linha em `sla_policies` para a prioridade. Minutos corridos.
export const DEFAULT_SLA_MINUTES: Record<TicketPriority, { firstResponseMinutes: number; resolutionMinutes: number }> = {
  urgent: { firstResponseMinutes: 15, resolutionMinutes: 4 * 60 },
  high: { firstResponseMinutes: 30, resolutionMinutes: 8 * 60 },
  normal: { firstResponseMinutes: 60, resolutionMinutes: 24 * 60 },
  low: { firstResponseMinutes: 4 * 60, resolutionMinutes: 72 * 60 },
};

// Fração do prazo a partir da qual o chamado entra em "risco" (§2.4 — "cruza 80 % do prazo").
export const SLA_AT_RISK_FRACTION = 0.8;

const MINUTE_MS = 60_000;

export function slaDueAt(startedAt: Date, resolutionMinutes: number): Date {
  return new Date(startedAt.getTime() + resolutionMinutes * MINUTE_MS);
}

// O necessário e suficiente para derivar o estado — `createdAt` é a origem da janela do SLA.
export type SlaSnapshot = {
  slaDueAt: Date | null;
  resolvedAt: Date | null;
  createdAt: Date;
};

export function slaBreached(snapshot: SlaSnapshot, now: Date = new Date()): boolean {
  if (!snapshot.slaDueAt || snapshot.resolvedAt) return false;
  return snapshot.slaDueAt.getTime() <= now.getTime();
}

export function slaAtRisk(snapshot: SlaSnapshot, now: Date = new Date()): boolean {
  if (!snapshot.slaDueAt || snapshot.resolvedAt) return false;
  if (slaBreached(snapshot, now)) return false;
  const windowMs = snapshot.slaDueAt.getTime() - snapshot.createdAt.getTime();
  if (windowMs <= 0) return true; // prazo já vencido na origem — trata como risco imediato
  const elapsedMs = now.getTime() - snapshot.createdAt.getTime();
  return elapsedMs >= SLA_AT_RISK_FRACTION * windowMs;
}

export function slaState(snapshot: SlaSnapshot, now: Date = new Date()): SlaState {
  if (!snapshot.slaDueAt) return "none";
  if (snapshot.resolvedAt) return "ok";
  if (slaBreached(snapshot, now)) return "breached";
  if (slaAtRisk(snapshot, now)) return "at_risk";
  return "ok";
}

// Um chamado que precisa de linha `sla_at_risk` para a fila: passou de 80 % do prazo (ou já
// estourou) e ainda não foi resolvido. Usado pela varredura de shared/notify → features/sla.
export function needsSlaAtRiskAlert(snapshot: SlaSnapshot, now: Date = new Date()): boolean {
  return slaAtRisk(snapshot, now) || slaBreached(snapshot, now);
}
