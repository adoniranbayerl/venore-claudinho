import { beginOperation, endOperation } from "@/observability";
import { deleteInstitutionById } from "./store";
import type { DeleteInstitutionCommand, DeleteInstitutionResult } from "./types";

export async function deleteInstitution(command: DeleteInstitutionCommand): Promise<DeleteInstitutionResult> {
  const handle = beginOperation({
    useCase: "enrollment-dashboard.delete-institution",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const deleted = await deleteInstitutionById(command.institutionId);
  if (!deleted) {
    const error = { code: "enrollment-dashboard.institution_not_found", message: "Instituição não encontrada." };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  endOperation(handle, { success: true });
  return { success: true, data: { institutionId: command.institutionId } };
}
