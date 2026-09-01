import type { OperationResult } from "@/shared/types";
import type { QueueRecord, TicketPriority } from "../../../contracts/types";

export type UpdateQueueCommand = {
  queueId: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  // Fase 4 — omitido = mantém a prioridade padrão atual da fila.
  defaultPriority?: TicketPriority;
  actorId: string;
};

export type UpdateQueueInput = Omit<UpdateQueueCommand, "actorId">;
export type UpdateQueueResult = OperationResult<QueueRecord>;
