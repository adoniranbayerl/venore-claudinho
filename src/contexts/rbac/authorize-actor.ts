import { getCurrentUser } from "@/contexts/auth";
import { getUserContext } from "./features/role-assignment/get-user-context/service";

export type AuthorizeActorResult =
  | { authorized: true; actorId: string }
  | { authorized: false; error: { code: string; message: string } };

export async function authorizeActor(requiredPermission: string): Promise<AuthorizeActorResult> {
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

  if (context.data.isSuperadmin || context.data.permissions.includes(requiredPermission)) {
    return { authorized: true, actorId: currentUser.data.id };
  }

  return {
    authorized: false,
    error: {
      code: "rbac.authorization.forbidden",
      message: `Ator não tem a permission "${requiredPermission}".`,
    },
  };
}
