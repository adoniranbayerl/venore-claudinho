import { authorizeActor } from "@/contexts/rbac";
import { clearDiagnosticsEvents, countDiagnosticsEvents } from "@/observability";
import type { OperationResult } from "@/shared/types";

// Ponto de composição fora de observability/ (docs/venore-docks.md — regra 12/14, mesmo motivo
// de platform/media-lifecycle/delete-media-safely.ts): observability/ não pode importar
// @/contexts/rbac porque contexts já importam observability/ pra logar (import de volta fecharia
// ciclo). authorizeActor mora aqui, não dentro do handler de observability.
export async function clearDiagnosticsEventsSafely(confirmed: boolean): Promise<OperationResult<{ cleared: number }>> {
  const auth = await authorizeActor("observability.logs.clear");
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  return clearDiagnosticsEvents({ id: auth.actorId, type: "user" }, confirmed);
}

// Leitura pura pra UI montar o texto de confirmação ("N registros serão removidos") antes do
// usuário decidir — mesma permission de clearDiagnosticsEventsSafely, já que expõe o volume do
// log operacional.
export async function getDiagnosticsEventsClearCountSafely(): Promise<OperationResult<{ count: number }>> {
  const auth = await authorizeActor("observability.logs.clear");
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  const count = await countDiagnosticsEvents();
  return { success: true, data: { count } };
}
