import { getCurrentUser } from "@/contexts/auth";
import { getUserContext } from "./features/role-assignment/get-user-context/service";

export type AuthorizeActorResult =
  | { authorized: true; actorId: string }
  | { authorized: false; error: { code: string; message: string } };

// Aceita uma permission única ou uma lista — "tem qualquer uma delas" (OR), nunca "todas"
// (mesmo contrato que AdminNavItemDefinition.requiredPermission já usa pra grupos de nav, ver
// platform/admin-shell/admin-navigation.contracts.ts). Existe pra casos como publish-entry: quem
// já tem a permission ampla (cms.entries.manage) continua podendo publicar sem precisar também
// da nova, mais estreita (cms.entries.publish) — a lista é a permission estreita primeiro, a
// ampla depois, só por convenção de leitura, a ordem não importa pro resultado.
export async function authorizeActor(requiredPermission: string | string[]): Promise<AuthorizeActorResult> {
  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return {
      authorized: false,
      error: {
        code: "rbac.authorization.unauthenticated",
        message: "É necessário estar autenticado para executar esta operação.",
      },
    };
  }

  const context = await getUserContext({ userId: currentUser.data.id });
  if (!context.success) {
    return { authorized: false, error: context.error };
  }

  const requiredPermissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];

  if (context.data.isSuperadmin || requiredPermissions.some((permission) => context.data.permissions.includes(permission))) {
    return { authorized: true, actorId: currentUser.data.id };
  }

  return {
    authorized: false,
    error: {
      code: "rbac.authorization.forbidden",
      message: `Ator não tem a permission "${requiredPermissions.join('" ou "')}".`,
    },
  };
}
