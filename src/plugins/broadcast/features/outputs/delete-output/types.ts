import type { OperationResult } from "@/shared/types";

export type DeleteOutputInput = { outputId: string };
export type DeleteOutputResult = OperationResult<{ id: string }>;
