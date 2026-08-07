import type { OperationResult } from "@/shared/types";
import type { BroadcastOutputRecord } from "../../../contracts/types";

export type CreateOutputCommand = { name: string; actorId: string };
export type CreateOutputInput = Omit<CreateOutputCommand, "actorId">;
export type CreateOutputResult = OperationResult<BroadcastOutputRecord>;
