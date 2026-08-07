import type { OperationResult } from "@/shared/types";
import type { BroadcastAgendaRecord } from "../../../contracts/types";

export type ListAgendasResult = OperationResult<BroadcastAgendaRecord[]>;
