import type { TvBoardWithScreens, TvScreenRecord } from "../../../contracts/types";
import { findAllBoards, findScreensForBoards } from "../shared/store";
import type { ListTvBoardsResult } from "./types";

export async function listTvBoards(): Promise<ListTvBoardsResult> {
  const boards = await findAllBoards();
  const screens = await findScreensForBoards(boards.map((board) => board.id));

  const screensByBoard = new Map<string, TvScreenRecord[]>();
  for (const screen of screens) {
    const list = screensByBoard.get(screen.boardId) ?? [];
    list.push(screen);
    screensByBoard.set(screen.boardId, list);
  }

  const data: TvBoardWithScreens[] = boards.map((board) => ({
    board,
    screens: screensByBoard.get(board.id) ?? [],
  }));

  return { success: true, data };
}
