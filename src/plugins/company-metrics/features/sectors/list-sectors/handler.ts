import { resolveManageableSectors } from "../../../shared/scoped-authorization";
import { listSectors } from "./service";
import type { ListSectorsResult } from "./types";

// company-metrics.manage → lista tudo; company-metrics.contribute → só os setores atribuídos;
// nenhuma das duas → 403.
export async function listSectorsHandler(options?: { includeArchived?: boolean }): Promise<ListSectorsResult> {
  const visible = await resolveManageableSectors();

  if (visible.scope === "none") {
    return {
      success: false,
      error: { code: "company-metrics.list-sectors.forbidden", message: "Você não tem acesso a Métricas Internas." },
    };
  }

  return listSectors({
    includeArchived: options?.includeArchived,
    allowedSectorIds: visible.scope === "scoped" ? visible.sectorIds : undefined,
  });
}
