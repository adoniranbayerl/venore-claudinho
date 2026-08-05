import { authorizeActor } from "@/contexts/rbac";
import { IMPORT_EXPORT_REQUIRED_PERMISSIONS } from "../../../contracts/types";
import { exportSiteBundle } from "./service";
import type { ExportSiteBundleResult } from "./types";

// authorizeActor só sabe OR entre uma lista de permissions — exportar o pacote inteiro (CMS +
// mídia) exige TODAS as permissions envolvidas, uma checagem por vez (ver comentário de
// IMPORT_EXPORT_REQUIRED_PERMISSIONS). Sem este gate, listContentTypes/listCategories (leitura
// pública, sem authorizeActor próprio) exportariam catálogo pra qualquer ator autenticado.
export async function exportSiteBundleHandler(): Promise<ExportSiteBundleResult> {
  for (const permission of IMPORT_EXPORT_REQUIRED_PERMISSIONS) {
    const authz = await authorizeActor(permission);
    if (!authz.authorized) {
      return { success: false, error: authz.error };
    }
  }

  return exportSiteBundle();
}
