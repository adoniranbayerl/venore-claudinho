import { authorizeSectorActor, resolveManageableSectors } from "../../../shared/scoped-authorization";
import { listSectorGroups } from "./service";
import type { ListSectorGroupsResult } from "./types";

// Com sectorId → grupos de um setor (qualquer membro vê). Sem sectorId → todos os grupos dos
// setores visíveis ao ator (para a tela de admin montar tudo de uma vez).
export async function listSectorGroupsHandler(sectorId?: string): Promise<ListSectorGroupsResult> {
  if (sectorId && sectorId.trim().length > 0) {
    const authz = await authorizeSectorActor(sectorId, "viewer");
    if (!authz.authorized) {
      return { success: false, error: authz.error };
    }
    return listSectorGroups({ sectorId });
  }

  const visible = await resolveManageableSectors();
  if (visible.scope === "none") {
    return { success: false, error: { code: "company-metrics.list-sector-groups.forbidden", message: "Você não tem acesso a Métricas Internas." } };
  }
  return listSectorGroups(visible.scope === "scoped" ? { sectorIds: visible.sectorIds } : {});
}
