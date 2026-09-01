import type { OperationResult } from "@/shared/types";
import type { TicketRecord } from "../../../contracts/types";

// Reabertura pelo solicitante (docs/chamados-plugin.md §5) — "reabertura pelo solicitante em até
// N dias; reopened_count++". Dois caminhos, ambos SÓ para o solicitante (nunca a equipe — a
// equipe reabre por change-status, que exige helpdesk.manage para sair de um estado final):
//  - portal logado: `ReopenTicketInput` (o handler resolve o ator da sessão e confere que é o
//    `requester_user_id` do chamado);
//  - link de acompanhamento anônimo: `ReopenTrackedTicketInput` (o token autoriza, com throttle).
export type ReopenTicketInput = { ticketId: string; note?: string | null };
export type ReopenTrackedTicketInput = { trackingToken: string; note?: string | null };

export type ReopenTicketResult = OperationResult<TicketRecord>;
