import { countGroupsBySector, countMembersBySector, findSectors } from "./store";
import type { ListSectorsResult, SectorListItem } from "./types";

// allowedSectorIds recorta pra só os setores em que o ator é membro — passado pelo handler quando
// ele só tem company-metrics.contribute (não company-metrics.manage). undefined = sem recorte.
export async function listSectors(options?: {
  includeArchived?: boolean;
  allowedSectorIds?: string[];
}): Promise<ListSectorsResult> {
  const rows = await findSectors({
    includeArchived: options?.includeArchived ?? false,
    sectorIds: options?.allowedSectorIds,
  });

  const ids = rows.map((row) => row.id);
  const [memberCounts, groupCounts] = await Promise.all([countMembersBySector(ids), countGroupsBySector(ids)]);

  const data: SectorListItem[] = rows.map((row) => ({
    ...row,
    memberCount: memberCounts.get(row.id) ?? 0,
    groupCount: groupCounts.get(row.id) ?? 0,
  }));

  return { success: true, data };
}
