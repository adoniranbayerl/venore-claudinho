import { listCategories } from "@/contexts/cms";
import { RBAC_SCOPE_TYPES } from "@/contexts/rbac";

// Composição CMS + RBAC para a tela de atribuição de papel em /admin/rbac (Fase C de
// docs/rbac-scoped-roles.md, D5 / regra 10 de docs/venore-docks.md): o `rbac` NÃO importa `cms`
// — a ponte que resolve as INSTÂNCIAS de escopo (nomes de categoria) mora aqui, em platform/.
//
// `scopablePermissionKeys`: união das keys recortáveis por `cms.category` (derivada de
// RBAC_SCOPE_TYPES). A tela usa isso para decidir se um papel abre o multi-select de categorias
// (quando `role.permissionKeys` intersecta esta lista).

export type CmsCategoryOption = { id: string; name: string };

export type RbacScopeOptions = {
  categories: CmsCategoryOption[];
  scopablePermissionKeys: string[];
};

export async function getRbacScopeOptions(): Promise<RbacScopeOptions> {
  const scopablePermissionKeys = [
    ...new Set(RBAC_SCOPE_TYPES.flatMap((scope) => [...scope.scopablePermissionKeys])),
  ];

  const categoriesResult = await listCategories();
  const categories = categoriesResult.success
    ? categoriesResult.data.map((category) => ({ id: category.id, name: category.name }))
    : [];

  return { categories, scopablePermissionKeys };
}
