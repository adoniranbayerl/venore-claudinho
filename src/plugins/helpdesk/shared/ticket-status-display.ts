import type { TicketStatus } from "../contracts/types";

// Rótulos e cor (token shadcn, nunca cor crua) por status — usados no portal, na tabela do admin
// e no drawer. `variant` casa com os variants de <Badge> (src/components/ui/badge.tsx).
export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Aberto",
  in_progress: "Em andamento",
  waiting: "Aguardando você",
  resolved: "Resolvido",
  closed: "Fechado",
  cancelled: "Cancelado",
};

export const TICKET_STATUS_BADGE_VARIANT: Record<TicketStatus, "default" | "secondary" | "outline" | "destructive"> = {
  open: "default",
  in_progress: "default",
  waiting: "destructive",
  resolved: "secondary",
  closed: "outline",
  cancelled: "outline",
};

// Rótulo de status pra equipe (a fila vê "Aguardando solicitante", não "Aguardando você").
export const TICKET_STATUS_LABELS_TEAM: Record<TicketStatus, string> = {
  ...TICKET_STATUS_LABELS,
  waiting: "Aguardando solicitante",
};
