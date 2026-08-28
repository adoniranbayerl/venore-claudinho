import { getCurrentUser } from "@/contexts/auth";
import { getUserContext } from "./features/role-assignment/get-user-context/service";

export type AuthorizeActorResult =
  | { authorized: true; actorId: string }
  | { authorized: false; error: { code: string; message: string } };

// Fase B de docs/rbac-scoped-roles.md (D3). 2º argumento OPCIONAL — sem ele, o caminho é o de
// sempre, bit a bit. Nenhum call site passa `scope` nesta fase (a infra é dormente).
export type AuthorizeActorScope = { type: string; resourceId: string };

// Para FILTRAR listagens (não é sim/não, é "quais ids"): ver resolveScope abaixo.
export type ResolveScopeResult =
  | { kind: "global" }
  | { kind: "scoped"; resourceIds: string[] }
  | { kind: "none" };

// Aceita uma permission única ou uma lista — "tem qualquer uma delas" (OR), nunca "todas"
// (mesmo contrato que AdminNavItemDefinition.requiredPermission já usa pra grupos de nav, ver
// platform/admin-shell/admin-navigation.contracts.ts). Existe pra casos como publish-entry: quem
// já tem a permission ampla (cms.entries.manage) continua podendo publicar sem precisar também
// da nova, mais estreita (cms.entries.publish) — a lista é a permission estreita primeiro, a
// ampla depois, só por convenção de leitura, a ordem não importa pro resultado.
//
// `scope` (opcional, D3): quando dado, além de ter a permission o ator precisa que ela ALCANCE
// aquele recurso — `scope.type` "global" passa; lista de ids passa se `scope.resourceId` estiver
// nela; ausente nega (`rbac.authorization.forbidden_scope`). superadmin ignora escopo.
export async function authorizeActor(
  requiredPermission: string | string[],
  scope?: AuthorizeActorScope,
): Promise<AuthorizeActorResult> {
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

  const actorId = currentUser.data.id;
  const requiredPermissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];

  if (context.data.isSuperadmin) {
    return { authorized: true, actorId };
  }

  const hasPermission = requiredPermissions.some((permission) => context.data.permissions.includes(permission));
  if (!hasPermission) {
    return {
      authorized: false,
      error: {
        code: "rbac.authorization.forbidden",
        message: `Ator não tem a permission "${requiredPermissions.join('" ou "')}".`,
      },
    };
  }

  if (!scope) {
    return { authorized: true, actorId };
  }

  const scopeSatisfied = requiredPermissions.some((permission) => {
    const value = context.data.scopedPermissions[permission]?.[scope.type];
    if (value === "global") return true;
    if (Array.isArray(value)) return value.includes(scope.resourceId);
    return false;
  });

  if (scopeSatisfied) {
    return { authorized: true, actorId };
  }

  return {
    authorized: false,
    error: {
      code: "rbac.authorization.forbidden_scope",
      message: `Ator não tem acesso ao recurso "${scope.resourceId}" para "${requiredPermissions.join('" ou "')}".`,
    },
  };
}

// Resolve o alcance efetivo de UMA permission key num scopeType, pro ator corrente — para
// listagens filtrarem por id em vez de fazer um sim/não por recurso (D3). Lê o mesmo
// getUserContext / getCurrentUser de authorizeActor.
//
// - superadmin, ou algum papel concede a key sem escopo daquele tipo → { kind: "global" }.
// - a key é escopada → { kind: "scoped", resourceIds } (união dos ids permitidos).
// - o ator não tem a key de jeito nenhum → { kind: "none" }.
// - tem a key mas ela não é recortável por esse scopeType (não está em RBAC_SCOPE_TYPES) →
//   { kind: "global" }: sem recorte nesse eixo, o alcance é o da permission que ele de fato tem.
export async function resolveScope(permissionKey: string, scopeType: string): Promise<ResolveScopeResult> {
  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return { kind: "none" };
  }

  const context = await getUserContext({ userId: currentUser.data.id });
  if (!context.success) {
    return { kind: "none" };
  }

  if (context.data.isSuperadmin) {
    return { kind: "global" };
  }

  if (!context.data.permissions.includes(permissionKey)) {
    return { kind: "none" };
  }

  const value = context.data.scopedPermissions[permissionKey]?.[scopeType];
  if (Array.isArray(value)) {
    return { kind: "scoped", resourceIds: value };
  }
  return { kind: "global" };
}
