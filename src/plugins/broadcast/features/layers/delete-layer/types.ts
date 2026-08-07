import type { OperationResult } from "@/shared/types";

export type DeleteLayerInput = { layerId: string };
export type DeleteLayerResult = OperationResult<{ id: string }>;
