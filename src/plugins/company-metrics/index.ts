// Barrel público do plugin (regra 2 do AGENTS.md) — outros plugins/temas/platform só importam
// daqui ou de ./contracts, nunca de ./database/schema, ./features/*/store|service ou ./shared/*.
// Expandido a cada fase de docs/metricas-internas-plugin.md.

export type {
  SectorRecord,
  SectorGroupRecord,
  SectorMemberRecord,
  SectorMemberRole,
} from "./contracts/types";
export { SECTOR_MEMBER_ROLES } from "./contracts/types";

// Fase 1 — setores
export { createSectorHandler as createSector } from "./features/sectors/create-sector/handler";
export { updateSectorHandler as updateSector } from "./features/sectors/update-sector/handler";
export { archiveSectorHandler as archiveSector } from "./features/sectors/archive-sector/handler";
export { listSectorsHandler as listSectors } from "./features/sectors/list-sectors/handler";
export { setSectorMembersHandler as setSectorMembers } from "./features/sectors/set-sector-members/handler";
export { listSectorMembersHandler as listSectorMembers } from "./features/sectors/list-sector-members/handler";

export type { CreateSectorInput, CreateSectorResult } from "./features/sectors/create-sector/types";
export type { UpdateSectorInput, UpdateSectorResult } from "./features/sectors/update-sector/types";
export type { ArchiveSectorInput, ArchiveSectorResult } from "./features/sectors/archive-sector/types";
export type { ListSectorsResult, SectorListItem } from "./features/sectors/list-sectors/types";
export type {
  SetSectorMembersInput,
  SetSectorMembersResult,
  SectorMemberAssignment,
} from "./features/sectors/set-sector-members/types";
export type { ListSectorMembersResult } from "./features/sectors/list-sector-members/types";

// Fase 1 — grupos
export { createSectorGroupHandler as createSectorGroup } from "./features/groups/create-sector-group/handler";
export { updateSectorGroupHandler as updateSectorGroup } from "./features/groups/update-sector-group/handler";
export { deleteSectorGroupHandler as deleteSectorGroup } from "./features/groups/delete-sector-group/handler";
export { listSectorGroupsHandler as listSectorGroups } from "./features/groups/list-sector-groups/handler";

export type { CreateSectorGroupInput, CreateSectorGroupResult } from "./features/groups/create-sector-group/types";
export type { UpdateSectorGroupInput, UpdateSectorGroupResult } from "./features/groups/update-sector-group/types";
export type { DeleteSectorGroupInput, DeleteSectorGroupResult } from "./features/groups/delete-sector-group/types";
export type { ListSectorGroupsResult } from "./features/groups/list-sector-groups/types";

// Ponto de extensão "seeds" do plugin engine (platform/plugin-engine/plugin-seed-registry.ts).
export { companyMetricsSeeds } from "./seeds";
