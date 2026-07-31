import { clearEvents as clearEventsService } from "./service";
import { countAllEvents } from "./store";
import type { ActorRef } from "../../contracts/types";
import type { ClearEventsResult } from "./types";

// Leitura pura (não apaga nada) — usada pela UI pra montar o texto de confirmação antes do
// usuário decidir limpar de verdade, mesmo padrão de countUsersWithPermissionsHandler.
export async function countEventsHandler(): Promise<number> {
  return countAllEvents();
}

// Sem authorizeActor aqui, mesmo padrão do resto de observability/ (é infraestrutura técnica, não
// context de domínio — importar @/contexts/rbac criaria dependência de volta, já que contexts
// importam observability/ pra logar). A checagem de permission fica no ponto de composição
// (platform/admin-shell/clear-diagnostics-events.ts), mesmo motivo de deleteMediaSafely viver em
// platform/media-lifecycle e não dentro de contexts/media.
export async function clearEventsHandler(actor: ActorRef, confirmed: boolean): Promise<ClearEventsResult> {
  return clearEventsService({ actor, confirmed });
}
