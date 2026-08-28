import { authorizeAnyConfigActor } from "../../../shared/scoped-authorization";
import { setTvScreens } from "./service";
import type { SetTvScreensInput, SetTvScreensResult } from "./types";

export async function setTvScreensHandler(input: SetTvScreensInput): Promise<SetTvScreensResult> {
  if (!input.boardId || input.boardId.trim().length === 0) {
    return { success: false, error: { code: "company-metrics.set-tv-screens.missing_board", message: "Painel não informado." } };
  }

  const authz = await authorizeAnyConfigActor();
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }
  return setTvScreens({ ...input, actorId: authz.actorId });
}
