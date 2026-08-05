import type { OperationResult } from "@/shared/types";

export type PurgeMediaAssetCommand = { id: string; actorId: string };
export type PurgeMediaAssetInput = Omit<PurgeMediaAssetCommand, "actorId">;
export type PurgeMediaAssetResult = OperationResult<{ id: string }>;
