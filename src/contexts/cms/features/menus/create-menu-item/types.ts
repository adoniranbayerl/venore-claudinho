import type { OperationResult } from "@/shared/types";
import type { MenuItemRecord } from "../../../contracts/types";

export type CreateMenuItemCommand = { location: string; label: string; href: string; actorId: string };
export type CreateMenuItemInput = Omit<CreateMenuItemCommand, "actorId">;
export type CreateMenuItemResult = OperationResult<MenuItemRecord>;
