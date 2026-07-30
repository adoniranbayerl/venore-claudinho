import type { OperationResult } from "@/shared/types";

export type ClearCategoryAssetsInput = { categoryId: string };
export type ClearCategoryAssetsResult = OperationResult<{ clearedCount: number }>;
