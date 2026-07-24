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

export type AdminNavItem = {
  key: string;
  label: string;
  href: string;
  // Array = satisfeito se o ator tiver qualquer uma das permissions (ex: seção com várias
  // sub-áreas cada uma com sua própria permission, como /admin/cms).
  requiredPermission?: string | string[];
};

export type AdminNavGroup = {
  key: string;
  label: string;
  items: AdminNavItem[];
};
