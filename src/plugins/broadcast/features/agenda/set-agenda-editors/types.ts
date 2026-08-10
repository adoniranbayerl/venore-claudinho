import type { OperationResult } from "@/shared/types";

export type SetAgendaEditorsCommand = { agendaId: string; userIds: string[]; actorId: string };
export type SetAgendaEditorsInput = Omit<SetAgendaEditorsCommand, "actorId">;
export type SetAgendaEditorsResult = OperationResult<{ agendaId: string; userIds: string[] }>;
