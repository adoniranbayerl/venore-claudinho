import type { OperationResult } from "@/shared/types";

// Fase 7 — avaliação por dois caminhos (§2.2 `rating_score`): o link de acompanhamento anônimo
// (`RateTicketInput`, token) e o portal do solicitante logado (`RateOwnTicketInput`, id + sessão).
// Os dois gravam o evento `rating` + denormalizam `tickets.rating_score`.
export type RateTicketInput = {
  trackingToken: string;
  score: number;
  comment?: string | null;
};

export type RateOwnTicketInput = {
  ticketId: string;
  score: number;
  comment?: string | null;
};

export type RateTicketResult = OperationResult<{ score: number }>;
