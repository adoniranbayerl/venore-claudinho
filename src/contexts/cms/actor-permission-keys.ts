import { getCurrentUser } from "@/contexts/auth";
import { getUserContext } from "@/contexts/rbac";

// Item de menu "route" com requiredPermissionKey é filtrado pela permission do ator, no servidor
// (regra de navegação) — leitura pública de menu não tem UMA permission fixa pra checar (ao
// contrário de authorizeActor), então este helper devolve o conjunto de permissions do ator
// atual (vazio se anônimo) pra cada item decidir por si.
export async function getActorPermissionKeys(): Promise<ReadonlySet<string>> {
  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return new Set();
  }

  const context = await getUserContext({ userId: currentUser.data.id });
  if (!context.success) {
    return new Set();
  }

  if (context.data.isSuperadmin) {
    return new Set(["*"]);
  }

  return new Set(context.data.permissions);
}
