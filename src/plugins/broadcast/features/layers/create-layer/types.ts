import type { OperationResult } from "@/shared/types";
import type { BroadcastLayerRecord, BroadcastLayerType } from "../../../contracts/types";

export type CreateLayerCommand = {
  sceneId: string;
  type: BroadcastLayerType;
  name: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  zIndex?: number;
  config?: Record<string, unknown>;
  visible?: boolean;
  actorId: string;
};

export type CreateLayerInput = Omit<CreateLayerCommand, "actorId">;
export type CreateLayerResult = OperationResult<BroadcastLayerRecord>;
