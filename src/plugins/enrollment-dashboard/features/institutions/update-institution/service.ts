import { beginOperation, endOperation } from "@/observability";
import { applyInstitutionUpdate, findInstitutionById } from "./store";
import type { UpdateInstitutionCommand, UpdateInstitutionResult } from "./types";

export async function updateInstitution(command: UpdateInstitutionCommand): Promise<UpdateInstitutionResult> {
  const handle = beginOperation({
    useCase: "enrollment-dashboard.update-institution",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const existing = await findInstitutionById(command.institutionId);
  if (!existing) {
    const error = { code: "enrollment-dashboard.institution_not_found", message: "Instituição não encontrada." };
    endOperation(handle, { success: false, error });
    return { success: false, error };
  }

  const record = await applyInstitutionUpdate({
    id: command.institutionId,
    name: command.name.trim(),
    logoMediaId: command.logoMediaId?.trim() || null,
    programLabel: command.programLabel.trim(),
  });

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
