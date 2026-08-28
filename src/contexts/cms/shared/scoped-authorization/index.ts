import { resolveScopeForActor } from "@/contexts/rbac";
import type { OperationResult } from "@/shared/types";

// Recorte por categoria do CMS (Fase C de docs/rbac-scoped-roles.md, §4.4). A regra de negócio
// de "este ator pode agir NESTA categoria?" vive aqui, num único ponto, porque é aplicada pelos
// service.ts de escrita de várias features de `entries` e `categories` e nenhuma delas é dona
// natural dela — mesmo espírito de src/plugins/broadcast/shared/scoped-authorization/.
//
// Por que no service (com actorId explícito) e não no handler via authorizeActor(perm, scope):
// todo teste de integração do repo bypassa o handler (next-auth stubado, auth() => null), então
// o enforcement precisa estar num ponto que recebe o actorId direto para ser exercitável. O
// handler continua fazendo o gate de seção (authorizeActor(perm)); o recorte fino é este.

const CMS_CATEGORY_SCOPE_TYPE = "cms.category";

// permissionKeys: as keys que podem satisfazer a ação (OR) — ex: ["cms.entries.manage"] ou
// ["cms.entries.publish"]. categoryId null = a ação não incide sobre uma categoria concreta
// (entry sem categoria, criar categoria nova): só quem tem a permission GLOBAL passa (D2).
export async function assertCmsCategoryScope(
  actorId: string,
  permissionKeys: string[],
  categoryId: string | null,
): Promise<OperationResult<void>> {
  let holdsAnyPermission = false;

  for (const key of permissionKeys) {
    const scope = await resolveScopeForActor(actorId, key, CMS_CATEGORY_SCOPE_TYPE);
    if (scope.kind === "none") continue;

    holdsAnyPermission = true;
    if (scope.kind === "global") {
      return { success: true, data: undefined };
    }
    if (categoryId !== null && scope.resourceIds.includes(categoryId)) {
      return { success: true, data: undefined };
    }
  }

  if (!holdsAnyPermission) {
    return {
      success: false,
      error: {
        code: "rbac.authorization.forbidden",
        message: `Ator não tem a permission "${permissionKeys.join('" ou "')}".`,
      },
    };
  }

  const area = permissionKeys[0]?.split(".")[1] ?? "entries";
  return {
    success: false,
    error: {
      code: `cms.${area}.forbidden_scope`,
      message:
        categoryId === null
          ? "Esta ação exige acesso global — seu papel está limitado a categorias específicas."
          : "Seu papel só permite agir nas categorias atribuídas a você.",
    },
  };
}
