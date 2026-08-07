import type { OperationResult } from "@/shared/types";
import type { BroadcastAlertRecord } from "../../../contracts/types";

export type PublishAlertCommand = { message: string; durationSeconds: number; actorId: string };
export type PublishAlertInput = Omit<PublishAlertCommand, "actorId">;
export type PublishAlertResult = OperationResult<BroadcastAlertRecord>;
