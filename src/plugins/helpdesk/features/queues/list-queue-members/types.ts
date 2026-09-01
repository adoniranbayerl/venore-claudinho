import type { OperationResult } from "@/shared/types";
import type { QueueMemberRecord } from "../../../contracts/types";

export type ListQueueMembersResult = OperationResult<QueueMemberRecord[]>;
