import type { OperationResult } from "@/shared/types";
import type { BroadcastAgendaEventRecord } from "../../../contracts/types";

export type UpdateAgendaEventCommand = {
  eventId: string;
  title: string;
  description?: string | null;
  startAt: Date;
  recurring?: boolean;
  endTime?: string | null;
  coverMediaAssetId?: string | null;
  actorId: string;
};

export type UpdateAgendaEventInput = Omit<UpdateAgendaEventCommand, "actorId">;
export type UpdateAgendaEventResult = OperationResult<BroadcastAgendaEventRecord>;
