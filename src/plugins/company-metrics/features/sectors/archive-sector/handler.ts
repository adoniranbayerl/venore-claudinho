import { authorizeActor } from "@/contexts/rbac";
import { archiveSector } from "./service";
import type { ArchiveSectorInput, ArchiveSectorResult } from "./types";

// Arquivar/reativar um setor inteiro é ação do administrador do plugin — company-metrics.manage,
// não do admin do setor.
export async function archiveSectorHandler(input: ArchiveSectorInput): Promise<ArchiveSectorResult> {
  if (input.sectorId.trim().length === 0) {
    return { success: false, error: { code: "company-metrics.archive-sector.missing_sector", message: "Setor não informado." } };
  }

  const authz = await authorizeActor("company-metrics.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return archiveSector({ ...input, actorId: authz.actorId });
}
