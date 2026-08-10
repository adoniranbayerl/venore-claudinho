import type { OperationResult } from "@/shared/types";

// Record<agendaId, outputId[]> — lista vazia pra uma agenda significa "sem vínculo, aparece em
// todas as saídas" (mesmo modelo opt-out do schema), não "vinculada a nenhuma".
export type ListAgendaOutputsResult = OperationResult<Record<string, string[]>>;
