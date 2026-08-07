import type { OperationResult } from "@/shared/types";
import type { BroadcastOutputRecord } from "../../../contracts/types";

export type SetOutputSceneCommand = { outputId: string; sceneId: string | null; actorId: string };
export type SetOutputSceneInput = Omit<SetOutputSceneCommand, "actorId">;
export type SetOutputSceneResult = OperationResult<BroadcastOutputRecord>;
