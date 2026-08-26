import { authorizeActor } from "@/contexts/rbac";
import { deleteInstitution } from "./service";
import type { DeleteInstitutionInput, DeleteInstitutionResult } from "./types";

export async function deleteInstitutionHandler(input: DeleteInstitutionInput): Promise<DeleteInstitutionResult> {
  if (input.institutionId.trim().length === 0) {
    return { success: false, error: { code: "enrollment-dashboard.invalid_institution_id", message: "Instituição inválida." } };
  }

  const authz = await authorizeActor("enrollment-dashboard.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return deleteInstitution({ ...input, actorId: authz.actorId });
}
