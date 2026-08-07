import type { OperationResult } from "@/shared/types";
import type { BroadcastLayerRecord } from "../../../contracts/types";

export type UpdateLayerCommand = {
  layerId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  config: Record<string, unknown>;
  visible: boolean;
  actorId: string;
};

export type UpdateLayerInput = Omit<UpdateLayerCommand, "actorId">;
export type UpdateLayerResult = OperationResult<BroadcastLayerRecord>;
