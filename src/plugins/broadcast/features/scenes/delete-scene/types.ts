import type { OperationResult } from "@/shared/types";

export type DeleteSceneInput = { sceneId: string };
export type DeleteSceneResult = OperationResult<{ id: string }>;
