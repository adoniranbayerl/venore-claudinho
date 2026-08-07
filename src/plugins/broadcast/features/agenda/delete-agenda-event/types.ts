import type { OperationResult } from "@/shared/types";

export type DeleteAgendaEventInput = { eventId: string };
export type DeleteAgendaEventResult = OperationResult<{ id: string }>;
