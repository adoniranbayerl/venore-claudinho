export type AdminActor = {
  id: string;
  name: string | null;
  email: string | null;
  isSuperadmin: boolean;
  permissions: string[];
};

export type AdminPageGate =
  | { granted: true; actor: AdminActor }
  | { granted: false; reason: "unauthenticated" | "forbidden" };

// AdminNavItem/AdminNavGroup foram substituídos por AdminNavItemDefinition
// (./admin-navigation.contracts.ts) — cada context/plugin declara o próprio item nesse formato,
// agregado pelo registro em ./admin-navigation-registry.ts.
