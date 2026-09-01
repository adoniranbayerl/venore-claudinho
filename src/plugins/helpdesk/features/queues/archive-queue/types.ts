import type { OperationResult } from "@/shared/types";
import type { QueueRecord } from "../../../contracts/types";

export type ArchiveQueueCommand = {
  queueId: string;
  archived: boolean;
  actorId: string;
};

export type ArchiveQueueInput = Omit<ArchiveQueueCommand, "actorId">;
export type ArchiveQueueResult = OperationResult<QueueRecord>;
