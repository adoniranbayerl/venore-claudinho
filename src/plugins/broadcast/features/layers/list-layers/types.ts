import type { OperationResult } from "@/shared/types";
import type { BroadcastLayerRecord } from "../../../contracts/types";

export type ListLayersQuery = { sceneId: string };
export type ListLayersResult = OperationResult<BroadcastLayerRecord[]>;
