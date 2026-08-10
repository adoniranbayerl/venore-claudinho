import type { OperationResult } from "@/shared/types";
import type { BroadcastOutputRecord } from "../../../contracts/types";

export type SetOutputFooterCommand = { outputId: string; footerOpen: boolean; actorId: string };
export type SetOutputFooterInput = Omit<SetOutputFooterCommand, "actorId">;
export type SetOutputFooterResult = OperationResult<BroadcastOutputRecord>;
