import type { OperationResult } from "@/shared/types";

export type DeleteMediaCommand = { id: string; actorId: string };
export type DeleteMediaInput = Omit<DeleteMediaCommand, "actorId">;
export type DeleteMediaResult = OperationResult<{ id: string }>;
