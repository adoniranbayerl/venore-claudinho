import type { OperationResult } from "@/shared/types";

// Record<agendaId, userId[]> — lista vazia pra uma agenda significa "sem responsável atribuído".
export type ListAgendaEditorsResult = OperationResult<Record<string, string[]>>;
