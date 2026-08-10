import type { OperationResult } from "@/shared/types";
import type { BroadcastAgendaRecord } from "../../../contracts/types";

export type ReorderAgendasCommand = { agendaIds: string[]; actorId: string };
export type ReorderAgendasInput = Omit<ReorderAgendasCommand, "actorId">;
export type ReorderAgendasResult = OperationResult<BroadcastAgendaRecord[]>;
