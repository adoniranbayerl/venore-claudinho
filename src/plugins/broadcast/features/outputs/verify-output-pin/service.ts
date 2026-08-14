import { findOutputPinByToken } from "./store";
import type { VerifyOutputPinQuery, VerifyOutputPinResult } from "./types";

// Token inexistente não é erro AQUI — quem decide 404 é get-output-state (chamado logo em seguida
// pela mesma rota/página); aqui devolve "não protegida" pra deixar esse fluxo seguir normalmente.
export async function verifyOutputPin(query: VerifyOutputPinQuery): Promise<VerifyOutputPinResult> {
  const output = await findOutputPinByToken(query.token);
  if (!output || !output.pin) {
    return { success: true, data: { required: false, valid: true } };
  }

  const valid = typeof query.candidate === "string" && query.candidate.length > 0 && query.candidate === output.pin;
  return { success: true, data: { required: true, valid } };
}
