import type { OperationResult } from "@/shared/types";
import type { BoardLayout, BoardRecord } from "../../../contracts/types";

export type CreateBoardCommand = {
  label: string;
  // null = painel de todas as filas.
  queueId?: string | null;
  layout: BoardLayout;
  showAssignee: boolean;
  refreshSeconds: number;
  actorId: string;
};

export type CreateBoardInput = Omit<CreateBoardCommand, "actorId">;
export type CreateBoardResult = OperationResult<BoardRecord>;
