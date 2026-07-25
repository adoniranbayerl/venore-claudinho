import type { OperationResult } from "@/shared/types";
import type { MenuRecord } from "../../../contracts/types";

export type GetMenuByLocationQuery = { location: string };
export type GetMenuByLocationResult = OperationResult<MenuRecord>;
