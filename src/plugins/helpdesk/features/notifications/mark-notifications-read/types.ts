import type { OperationResult } from "@/shared/types";

// `ids` omitido ou vazio = marca TODAS as não lidas do ator como lidas.
export type MarkNotificationsReadInput = { ids?: string[] };

export type MarkNotificationsReadResult = OperationResult<{ markedCount: number; unreadCount: number }>;
