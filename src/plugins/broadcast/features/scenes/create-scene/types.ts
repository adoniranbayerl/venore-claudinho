import type { OperationResult } from "@/shared/types";
import type { BroadcastSceneRecord } from "../../../contracts/types";

export type CreateSceneCommand = { key: string; name: string; actorId: string };
export type CreateSceneInput = Omit<CreateSceneCommand, "actorId">;
export type CreateSceneResult = OperationResult<BroadcastSceneRecord>;
