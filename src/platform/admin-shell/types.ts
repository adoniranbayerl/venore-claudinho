export type AdminActor = {
  id: string;
  name: string | null;
  email: string | null;
  isSuperadmin: boolean;
  permissions: string[];
  // Fase C de docs/rbac-scoped-roles.md (§4.3): resumo do alcance do ator sobre categorias do
  // CMS, anexado só por getCmsPageData (por isso opcional). "global" = admin/superadmin ou papel
  // que concede cms.entries.manage sem escopo; string[] = editor/author escopado.
  cmsCategoryScope?: "global" | string[];
};

export type AdminPageGate =
  | { granted: true; actor: AdminActor }
  | { granted: false; reason: "unauthenticated" | "forbidden" };

// AdminNavItem/AdminNavGroup foram substituídos por AdminNavItemDefinition
// (./admin-navigation.contracts.ts) — cada context/plugin declara o próprio item nesse formato,
// agregado pelo registro em ./admin-navigation-registry.ts.
