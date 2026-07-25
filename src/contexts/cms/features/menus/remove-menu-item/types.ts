import type { OperationResult } from "@/shared/types";

export type RemoveMenuItemCommand = { menuItemId: string; actorId: string };
export type RemoveMenuItemInput = Omit<RemoveMenuItemCommand, "actorId">;
export type RemoveMenuItemResult = OperationResult<{ id: string }>;
