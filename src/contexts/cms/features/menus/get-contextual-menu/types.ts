import type { OperationResult } from "@/shared/types";
import type { ResolvedMenuItem } from "../../../menu-resolution";

export type GetContextualMenuQuery = { path: string };
export type GetContextualMenuResult = OperationResult<ResolvedMenuItem[]>;
