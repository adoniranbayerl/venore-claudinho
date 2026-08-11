import type { OperationResult } from "@/shared/types";
import type { BroadcastAgendaEventRecord } from "../../../contracts/types";

export type CreateAgendaEventCommand = {
  agendaId: string;
  title: string;
  description?: string | null;
  startAt: Date;
  recurring?: boolean;
  endTime?: string | null;
  coverMediaAssetId?: string | null;
  actorId: string;
};

export type CreateAgendaEventInput = Omit<CreateAgendaEventCommand, "actorId">;
export type CreateAgendaEventResult = OperationResult<BroadcastAgendaEventRecord>;
