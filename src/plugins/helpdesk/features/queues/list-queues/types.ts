import type { OperationResult } from "@/shared/types";
import type { QueueRecord } from "../../../contracts/types";

export type QueueListItem = QueueRecord & {
  memberCount: number;
  categoryCount: number;
};

export type ListQueuesResult = OperationResult<QueueListItem[]>;
