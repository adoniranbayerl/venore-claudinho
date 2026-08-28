import type { OperationResult } from "@/shared/types";
import type { BroadcastOutputRecord } from "../../../contracts/types";

export type SetOutputOfflineCommand = { outputId: string; offline: boolean; actorId: string };
export type SetOutputOfflineInput = Omit<SetOutputOfflineCommand, "actorId">;
export type SetOutputOfflineResult = OperationResult<BroadcastOutputRecord>;
