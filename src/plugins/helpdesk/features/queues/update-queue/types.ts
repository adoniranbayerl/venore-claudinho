import type { OperationResult } from "@/shared/types";
import type { QueueRecord } from "../../../contracts/types";

export type UpdateQueueCommand = {
  queueId: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  actorId: string;
};

export type UpdateQueueInput = Omit<UpdateQueueCommand, "actorId">;
export type UpdateQueueResult = OperationResult<QueueRecord>;
