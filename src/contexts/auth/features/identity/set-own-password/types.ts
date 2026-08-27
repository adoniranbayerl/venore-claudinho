import type { OperationResult } from "@/shared/types";

export type SetOwnPasswordCommand = { actorId: string; newPassword: string };
export type SetOwnPasswordInput = Omit<SetOwnPasswordCommand, "actorId">;
export type SetOwnPasswordResult = OperationResult<{ id: string }>;
