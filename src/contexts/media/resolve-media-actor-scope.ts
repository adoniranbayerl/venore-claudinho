import { getCurrentUser } from "@/contexts/auth";
import { getUserContext } from "@/contexts/rbac";

export type MediaActorScope = { actorId: string; isMediaAdmin: boolean };

// Resolve "quem está perguntando" pra filtragem de visibilidade em list-media/get-media — não é
// gate de permissão (nunca falha), só o contexto que o store usa pra decidir o que mostrar.
// `null` = sem sessão, equivalente a "não enxerga nada" pro chamador (mesma resposta de "não
// encontrado" usada pra asset privado de outro ator, nunca "sem permissão").
export async function resolveMediaActorScope(): Promise<MediaActorScope | null> {
  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return null;
  }

  const context = await getUserContext({ userId: currentUser.data.id });
  const isMediaAdmin = context.success && (context.data.isSuperadmin || context.data.permissions.includes("media.manage"));

  return { actorId: currentUser.data.id, isMediaAdmin };
}
