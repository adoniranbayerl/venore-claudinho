import { authorizeActor } from "@/contexts/rbac";
import { createSector } from "./service";
import { validateCreateSectorInput } from "./validation";
import type { CreateSectorInput, CreateSectorResult } from "./types";

// Criar setor é ação do administrador do plugin — company-metrics.manage, nunca escopada
// (não dá pra escopar algo que ainda não existe).
export async function createSectorHandler(input: CreateSectorInput): Promise<CreateSectorResult> {
  const validationError = validateCreateSectorInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor("company-metrics.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createSector({ ...input, actorId: authz.actorId });
}
