import { authorizeActor } from "@/contexts/rbac";
import { deleteProgram } from "./service";
import type { DeleteProgramInput, DeleteProgramResult } from "./types";

export async function deleteProgramHandler(input: DeleteProgramInput): Promise<DeleteProgramResult> {
  if (input.programId.trim().length === 0) {
    return { success: false, error: { code: "enrollment-dashboard.invalid_program_id", message: "Turma/curso inválido." } };
  }

  const authz = await authorizeActor("enrollment-dashboard.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return deleteProgram({ ...input, actorId: authz.actorId });
}
