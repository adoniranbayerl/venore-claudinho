import type { OperationResult } from "@/shared/types";
import type { SettingRecord } from "../../contracts/types";

export type SetSettingCommand = { key: string; value: unknown; actorId: string };
export type SetSettingInput = Omit<SetSettingCommand, "actorId">;
export type SetSettingResult = OperationResult<SettingRecord>;
