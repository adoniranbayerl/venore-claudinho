import type { OperationResult } from "@/shared/types";
import type { SettingRecord } from "../../contracts/types";

export type GetSettingQuery = { key: string };
export type GetSettingResult = OperationResult<SettingRecord | null>;
