import type { OperationResult } from "@/shared/types";
import type { BroadcastSceneRecord } from "../../../contracts/types";

export type UpdateSceneCommand = { sceneId: string; name: string; order: number; actorId: string };
export type UpdateSceneInput = Omit<UpdateSceneCommand, "actorId">;
export type UpdateSceneResult = OperationResult<BroadcastSceneRecord>;
