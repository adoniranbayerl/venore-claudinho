// Sem authorizeActor: auth não depende de rbac (evitaria ciclo, ver provision-user/service.ts),
// logo não pode checar permissions. Só deve ser chamado por código que já autorizou o ator
// (hoje, exclusivamente rbac/features/registration-approval/list-pending-registrations).
// Não usar diretamente de app/ ou plugins/.
import { listPendingUsers } from "./service";
import type { ListPendingUsersResult } from "./types";

export async function listPendingUsersHandler(): Promise<ListPendingUsersResult> {
  return listPendingUsers();
}
