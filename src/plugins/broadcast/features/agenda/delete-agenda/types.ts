import type { OperationResult } from "@/shared/types";

export type DeleteAgendaInput = { agendaId: string };
export type DeleteAgendaResult = OperationResult<{ id: string }>;
