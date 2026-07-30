import type { OperationResult } from "@/shared/types";

export type UpdateOwnAvatarCommand = { actorId: string; avatarMediaId: string | null };
export type UpdateOwnAvatarInput = Omit<UpdateOwnAvatarCommand, "actorId">;
export type UpdateOwnAvatarResult = OperationResult<{ id: string; avatarMediaId: string | null }>;
