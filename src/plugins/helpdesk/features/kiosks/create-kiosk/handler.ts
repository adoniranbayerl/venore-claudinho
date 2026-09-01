import { authorizeActor } from "@/contexts/rbac";
import { createKiosk } from "./service";
import { validateCreateKioskInput } from "./validation";
import type { CreateKioskInput, CreateKioskResult } from "./types";

// Quiosques são configuração do plugin (§3.1) — só `helpdesk.manage` cria/edita, não é escopado
// por fila (um quiosque pode nem fixar fila).
export async function createKioskHandler(input: CreateKioskInput): Promise<CreateKioskResult> {
  const validationError = validateCreateKioskInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const authz = await authorizeActor("helpdesk.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return createKiosk({ ...input, actorId: authz.actorId });
}
