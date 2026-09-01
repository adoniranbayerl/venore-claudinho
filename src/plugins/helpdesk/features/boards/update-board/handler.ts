import { authorizeActor } from "@/contexts/rbac";
import { updateBoard } from "./service";
import { validateUpdateBoardInput } from "./validation";
import type { UpdateBoardInput, UpdateBoardResult } from "./types";

export async function updateBoardHandler(input: UpdateBoardInput): Promise<UpdateBoardResult> {
  const validationError = validateUpdateBoardInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor("helpdesk.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return updateBoard({ ...input, actorId: authz.actorId });
}
