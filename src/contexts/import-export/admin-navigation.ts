import type { AdminNavItemDefinition } from "@/platform/admin-shell/admin-navigation.contracts";
import { IMPORT_EXPORT_REQUIRED_PERMISSIONS } from "./contracts/types";

export const importExportAdminNavigationItems: AdminNavItemDefinition[] = [
  {
    key: "import-export.overview",
    label: "Importar/Exportar",
    icon: "arrow-left-right",
    href: "/admin/import-export",
    groupKey: "content",
    groupLabel: "Editorial",
    groupOrder: 20,
    order: 90,
    // Nav mostra o link pra quem tem QUALQUER UMA das permissions (mesmo critério de
    // cms.overview) — a página em si exige TODAS ao carregar (get-import-export-page-data.ts),
    // porque exportar/importar o pacote inteiro não é seguro com permission parcial.
    requiredPermission: [...IMPORT_EXPORT_REQUIRED_PERMISSIONS],
  },
];
