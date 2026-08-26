import { beginOperation, endOperation } from "@/observability";
import { deleteProgramById } from "./store";
import type { DeleteProgramCommand, DeleteProgramResult } from "./types";

export async function deleteProgram(command: DeleteProgramCommand): Promise<DeleteProgramResult> {
  const handle = beginOperation({
    useCase: "enrollment-dashboard.delete-program",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const deleted = await deleteProgramById(command.programId);
  if (!deleted) {
    const error = { code: "enrollment-dashboard.program_not_found", message: "Turma/curso não encontrado." };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  endOperation(handle, { success: true });
  return { success: true, data: { programId: command.programId } };
}
