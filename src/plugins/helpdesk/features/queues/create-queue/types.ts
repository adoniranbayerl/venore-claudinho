import type { OperationResult } from "@/shared/types";
import type { QueueRecord, TicketPriority } from "../../../contracts/types";

export type CreateQueueCommand = {
  name: string;
  description?: string | null;
  icon?: string | null;
  // Fase 4 — prioridade padrão da fila; omitido cai no default do schema (`normal`).
  defaultPriority?: TicketPriority;
  actorId: string;
};

export type CreateQueueInput = Omit<CreateQueueCommand, "actorId">;
export type CreateQueueResult = OperationResult<QueueRecord>;
