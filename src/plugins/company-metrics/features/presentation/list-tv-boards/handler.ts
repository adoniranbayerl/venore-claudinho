import { authorizeAnyConfigActor } from "../../../shared/scoped-authorization";
import { listTvBoards } from "./service";
import type { ListTvBoardsResult } from "./types";

export async function listTvBoardsHandler(): Promise<ListTvBoardsResult> {
  const authz = await authorizeAnyConfigActor();
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }
  return listTvBoards();
}
