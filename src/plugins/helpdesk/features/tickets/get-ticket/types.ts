import type { OperationResult } from "@/shared/types";
import type { TicketDetail } from "../../../contracts/types";

// Ou pelo id direto, ou pelo número exibido (`{queueKey}-{seq}`) da URL `/chamados/:ticketRef`.
export type GetTicketQuery = { ticketId: string } | { queueKey: string; seq: number };

export type GetTicketResult = OperationResult<TicketDetail>;
