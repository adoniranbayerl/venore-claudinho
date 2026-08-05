import { IMPORT_EXPORT_REQUIRED_PERMISSIONS } from "@/contexts/import-export";
import { getAdminPageData } from "./get-admin-page-data";
import type { AdminPageGate } from "./types";

// Diferente de getCmsPageData (QUALQUER UMA das permissions da seção libera acesso): exportar ou
// importar o pacote inteiro (CMS + mídia) só é seguro com TODAS as permissions envolvidas, mesmo
// critério AND do próprio handler (contexts/import-export — IMPORT_EXPORT_REQUIRED_PERMISSIONS).
export async function getImportExportPageData(): Promise<AdminPageGate> {
  const gate = await getAdminPageData();
  if (!gate.granted) {
    return gate;
  }

  const hasFullAccess =
    gate.actor.isSuperadmin || IMPORT_EXPORT_REQUIRED_PERMISSIONS.every((permission) => gate.actor.permissions.includes(permission));
  if (!hasFullAccess) {
    return { granted: false, reason: "forbidden" };
  }

  return gate;
}
