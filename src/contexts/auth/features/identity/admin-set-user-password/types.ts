import type { OperationResult } from "@/shared/types";

export type AdminSetUserPasswordCommand = { actorId: string; targetUserId: string; newPassword: string };
export type AdminSetUserPasswordInput = Omit<AdminSetUserPasswordCommand, "actorId">;
export type AdminSetUserPasswordResult = OperationResult<{ id: string }>;
