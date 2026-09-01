import { authorizeActor } from "@/contexts/rbac";
import { createBoard } from "./service";
import { validateCreateBoardInput } from "./validation";
import type { CreateBoardInput, CreateBoardResult } from "./types";

// Painéis são configuração do plugin (§3.1) — só `helpdesk.manage` cria/edita/remove, não é
// escopado por fila (um painel pode mostrar todas as filas).
export async function createBoardHandler(input: CreateBoardInput): Promise<CreateBoardResult> {
  const validationError = validateCreateBoardInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor("helpdesk.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createBoard({ ...input, actorId: authz.actorId });
}
