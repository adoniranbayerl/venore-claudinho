import type { OperationResult } from "@/shared/types";
import type { MenuLocation } from "../../../contracts/types";
import type { ResolvedMenuItem } from "../../../menu-resolution";

export type GetMenuByLocationQuery = { location: Extract<MenuLocation, "main" | "header" | "sitemap"> };
export type GetMenuByLocationResult = OperationResult<ResolvedMenuItem[]>;
