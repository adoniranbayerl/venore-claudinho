import type { OperationResult } from "@/shared/types";
import type { EntryRecord } from "../../../contracts/types";

export type ScheduleEntryCommand = {
  id: string;
  scheduledPublishAt: Date;
  scheduledArchiveAt?: Date | null;
  actorId: string;
};
export type ScheduleEntryInput = Omit<ScheduleEntryCommand, "actorId">;
export type ScheduleEntryResult = OperationResult<EntryRecord>;
