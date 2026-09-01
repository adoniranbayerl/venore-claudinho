import type { OperationResult } from "@/shared/types";
import type { QueueRecord } from "../../../contracts/types";

export type CreateQueueCommand = {
  name: string;
  description?: string | null;
  icon?: string | null;
  actorId: string;
};

export type CreateQueueInput = Omit<CreateQueueCommand, "actorId">;
export type CreateQueueResult = OperationResult<QueueRecord>;
