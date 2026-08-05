import type { ResolveBlockDefinition } from "@/contexts/cms";
import { authorizeActor } from "@/contexts/rbac";
import { IMPORT_EXPORT_REQUIRED_PERMISSIONS } from "../../../contracts/types";
import { parseExportZip } from "../../../zip-codec";
import { importSiteBundle } from "./service";
import type { ImportSiteBundleResult } from "./types";

// resolveDefinition não tem default aqui de propósito (ver comentário em types.ts) — quem chama
// (app/api/import-export/import/route.ts) importa resolveBlockDefinition de
// platform/page-builder/block-registry e passa, mesmo wiring que a tela de edição de entry já faz
// pra publish-entry normal.
export type ImportSiteBundleHandlerInput = { zipData: Buffer; resolveDefinition: ResolveBlockDefinition };

// Mesmo gate AND de export-site-bundle (ver comentário lá) — importar grava em cms + media, então
// exige as mesmas permissions de escrita completas, não só "qualquer uma".
export async function importSiteBundleHandler(input: ImportSiteBundleHandlerInput): Promise<ImportSiteBundleResult> {
  let actorId = "";
  for (const permission of IMPORT_EXPORT_REQUIRED_PERMISSIONS) {
    const authz = await authorizeActor(permission);
    if (!authz.authorized) {
      return { success: false, error: authz.error };
    }
    actorId = authz.actorId;
  }

  let parsedZip: ReturnType<typeof parseExportZip>;
  try {
    parsedZip = parseExportZip(input.zipData);
  } catch (error) {
    return {
      success: false,
      error: {
        code: "import-export.invalid_zip",
        message: error instanceof Error ? error.message : "Não foi possível ler o arquivo .zip enviado.",
      },
    };
  }

  return importSiteBundle({
    manifest: parsedZip.manifest,
    files: parsedZip.files,
    actorId,
    resolveDefinition: input.resolveDefinition,
  });
}
