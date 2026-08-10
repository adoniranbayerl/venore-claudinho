import type { OperationResult } from "@/shared/types";

export type SetAgendaOutputsCommand = { agendaId: string; outputIds: string[]; actorId: string };
export type SetAgendaOutputsInput = Omit<SetAgendaOutputsCommand, "actorId">;
export type SetAgendaOutputsResult = OperationResult<{ agendaId: string; outputIds: string[] }>;
