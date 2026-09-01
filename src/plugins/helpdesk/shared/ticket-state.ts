import type { TicketStatus } from "../contracts/types";

// Mapa de transições permitidas + guardas do ciclo de vida do chamado (docs/chamados-plugin.md
// §5). Puro e sem I/O — coberto por teste unitário. Cada transição, quando aceita, grava um
// `ticket_event` `status_change` no mesmo service (change-status/service.ts).
//
//             ┌──────────── cancelled  (qualquer estado não-final; helpdesk.manage)
//             │
// open ──▶ in_progress ⇄ waiting
//             │
//             ▼
//         resolved ──▶ closed        (helpdesk.manage)
//             │
//             └──▶ in_progress       (reabertura — guarda de requester entra na Fase 7)

export const TICKET_STATUS_TRANSITIONS: Record<TicketStatus, readonly TicketStatus[]> = {
  open: ["in_progress", "waiting", "resolved", "cancelled"],
  in_progress: ["waiting", "resolved", "cancelled"],
  waiting: ["in_progress", "resolved", "cancelled"],
  resolved: ["in_progress", "closed", "cancelled"],
  // closed → só helpdesk.manage reabre (guarda `fromFinalRequiresManage` abaixo).
  closed: ["in_progress"],
  cancelled: [],
};

export function canTransition(from: TicketStatus, to: TicketStatus): boolean {
  return TICKET_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

// O que o ator corrente é em relação a este chamado. `hasManagePermission` = permission ampla
// `helpdesk.manage` (a única que fecha). `isQueueManager` = linha `manager` em queue_members da
// fila do chamado. `isAssignee` = é o técnico responsável. `isQueueMember` = qualquer papel na
// fila + `helpdesk.work`.
export type TicketActorCapabilities = {
  hasManagePermission: boolean;
  isQueueManager: boolean;
  isAssignee: boolean;
  isQueueMember: boolean;
};

export type TransitionCheck = { ok: true } | { ok: false; code: string; message: string };

const DENY = (code: string, message: string): TransitionCheck => ({ ok: false, code, message });

// Guardas, na ordem de §5:
//  - transição precisa existir no mapa;
//  - sair de um estado terminal (`closed`/`cancelled`) → só `helpdesk.manage`;
//  - `→ resolved` → só o assignee, um gestor da fila, ou `helpdesk.manage`;
//  - `→ closed` → só `helpdesk.manage` ("quem fecha é o admin");
//  - `→ cancelled` → só `helpdesk.manage`;
//  - demais (`in_progress`, `waiting`) → qualquer membro da fila (ou `helpdesk.manage`).
export function checkStatusTransition(
  from: TicketStatus,
  to: TicketStatus,
  actor: TicketActorCapabilities,
): TransitionCheck {
  if (from === to) {
    return DENY("helpdesk.change-status.noop", "O chamado já está nesse estado.");
  }
  if (!canTransition(from, to)) {
    return DENY("helpdesk.change-status.invalid_transition", `Não é possível mudar de "${from}" para "${to}".`);
  }

  const isFinal = from === "closed" || from === "cancelled";
  if (isFinal && !actor.hasManagePermission) {
    return DENY("helpdesk.change-status.reopen_forbidden", "Só um administrador de Chamados reabre um chamado fechado ou cancelado.");
  }

  if (to === "resolved" && !(actor.isAssignee || actor.isQueueManager || actor.hasManagePermission)) {
    return DENY("helpdesk.change-status.resolve_forbidden", "Só o técnico responsável ou um gestor da fila marca o chamado como resolvido.");
  }

  if (to === "closed" && !actor.hasManagePermission) {
    return DENY("helpdesk.change-status.close_forbidden", "Só um administrador de Chamados fecha um chamado.");
  }

  if (to === "cancelled" && !actor.hasManagePermission) {
    return DENY("helpdesk.change-status.cancel_forbidden", "Só um administrador de Chamados cancela um chamado.");
  }

  if (!(actor.isQueueMember || actor.hasManagePermission)) {
    return DENY("helpdesk.change-status.forbidden", "Você não atende essa fila.");
  }

  return { ok: true };
}

// Colunas de carimbo derivadas da transição — o service aplica junto do UPDATE de status.
export function timestampsForTransition(to: TicketStatus, now: Date): {
  resolvedAt?: Date | null;
  closedAt?: Date | null;
} {
  if (to === "resolved") return { resolvedAt: now };
  if (to === "closed") return { closedAt: now };
  // Reabrir limpa os carimbos finais.
  if (to === "in_progress") return { resolvedAt: null, closedAt: null };
  return {};
}
