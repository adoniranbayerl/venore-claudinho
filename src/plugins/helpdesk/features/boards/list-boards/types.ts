import type { OperationResult } from "@/shared/types";
import type { BoardRecord } from "../../../contracts/types";

export type BoardListItem = BoardRecord & { queueName: string | null };

export type ListBoardsResult = OperationResult<{
  boards: BoardListItem[];
  // Filas ativas para o seletor de fila no formulário do painel.
  queueOptions: { id: string; name: string }[];
}>;
