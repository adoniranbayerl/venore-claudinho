import type { OperationResult } from "@/shared/types";
import type { AdminResolvedMenuItem } from "../../../menu-resolution";
import type { MenuRecord } from "../../../contracts/types";

export type GetMenuTreeQuery = { menuId: string };
export type GetMenuTreeResult = OperationResult<{ menu: MenuRecord; items: AdminResolvedMenuItem[] }>;
