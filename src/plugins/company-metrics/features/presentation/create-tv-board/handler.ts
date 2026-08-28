import { authorizeAnyConfigActor } from "../../../shared/scoped-authorization";
import { createTvBoard } from "./service";
import type { CreateTvBoardInput, CreateTvBoardResult } from "./types";

export async function createTvBoardHandler(input: CreateTvBoardInput): Promise<CreateTvBoardResult> {
  const authz = await authorizeAnyConfigActor();
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }
  return createTvBoard({ ...input, actorId: authz.actorId });
}
