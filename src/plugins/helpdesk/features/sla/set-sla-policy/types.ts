import type { OperationResult } from "@/shared/types";
import type { SlaPolicyRecord, TicketPriority } from "../../../contracts/types";

export type SetSlaPolicyInput = {
  queueId: string;
  priority: TicketPriority;
  firstResponseMinutes: number;
  resolutionMinutes: number;
};

export type SetSlaPolicyCommand = SetSlaPolicyInput & { actorId: string };

export type SetSlaPolicyResult = OperationResult<SlaPolicyRecord>;
