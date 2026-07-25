import type { OperationResult } from "@/shared/types";
import type { MenuItemRecord } from "../../../contracts/types";

export type ReorderMenuItemsCommand = { menuId: string; menuItemIds: string[]; actorId: string };
export type ReorderMenuItemsInput = Omit<ReorderMenuItemsCommand, "actorId">;
export type ReorderMenuItemsResult = OperationResult<MenuItemRecord[]>;
