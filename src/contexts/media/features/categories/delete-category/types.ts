import type { OperationResult } from "@/shared/types";

export type DeleteCategoryInput = { id: string };
export type DeleteCategoryResult = OperationResult<{ id: string }>;
