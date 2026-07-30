import type { OperationResult } from "@/shared/types";

export type DeleteMediaAssetCommand = { id: string; actorId: string };
export type DeleteMediaAssetInput = Omit<DeleteMediaAssetCommand, "actorId">;
export type DeleteMediaAssetResult = OperationResult<{ id: string }>;
