import type { OperationResult } from "@/shared/types";

export type DeleteSectorGroupCommand = { groupId: string; actorId: string };
export type DeleteSectorGroupInput = Omit<DeleteSectorGroupCommand, "actorId">;
export type DeleteSectorGroupResult = OperationResult<{ groupId: string }>;
