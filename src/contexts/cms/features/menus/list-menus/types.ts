import type { OperationResult } from "@/shared/types";
import type { MenuRecord } from "../../../contracts/types";

export type ListMenusQuery = Record<string, never>;
export type ListMenusResult = OperationResult<Array<MenuRecord & { itemCount: number }>>;
