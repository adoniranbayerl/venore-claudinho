import type { OperationResult } from "@/shared/types";

export type DeleteTargetCommand = { targetId: string; actorId: string };
export type DeleteTargetInput = Omit<DeleteTargetCommand, "actorId">;
export type DeleteTargetResult = OperationResult<{ targetId: string }>;
