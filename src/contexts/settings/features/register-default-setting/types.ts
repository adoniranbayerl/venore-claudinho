import type { OperationResult } from "@/shared/types";

export type RegisterDefaultSettingInput = { key: string; value: unknown };
export type RegisterDefaultSettingResult = OperationResult<{ key: string; registered: boolean }>;
