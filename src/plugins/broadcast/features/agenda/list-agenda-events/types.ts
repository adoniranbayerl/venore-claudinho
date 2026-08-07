import type { OperationResult } from "@/shared/types";
import type { BroadcastAgendaEventRecord } from "../../../contracts/types";

export type ListAgendaEventsResult = OperationResult<BroadcastAgendaEventRecord[]>;
