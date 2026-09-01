import type { OperationResult } from "@/shared/types";
import type { BoardLayout, BoardRecord } from "../../../contracts/types";

export type UpdateBoardCommand = {
  boardId: string;
  label: string;
  queueId?: string | null;
  layout: BoardLayout;
  showAssignee: boolean;
  refreshSeconds: number;
  actorId: string;
};

export type UpdateBoardInput = Omit<UpdateBoardCommand, "actorId">;
export type UpdateBoardResult = OperationResult<BoardRecord>;
