// Barrel público do plugin (regra 2 do AGENTS.md) — outros plugins/temas/platform só importam
// daqui ou de ./contracts, nunca de ./database/schema, ./features/*/store|service ou ./shared/*.
// Expandido a cada fase de docs/metricas-internas-plugin.md.

export type {
  SectorRecord,
  SectorGroupRecord,
  SectorMemberRecord,
  SectorMemberRole,
  MetricDefinitionRecord,
  MetricValueRecord,
  MetricUnit,
  MetricAggregation,
  MetricDefinitionGranularity,
  MetricDirection,
} from "./contracts/types";
export {
  SECTOR_MEMBER_ROLES,
  METRIC_UNITS,
  METRIC_AGGREGATIONS,
  METRIC_DEFINITION_GRANULARITIES,
  METRIC_DIRECTIONS,
} from "./contracts/types";

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

// Fase 2 — definições de métrica
export { createMetricDefinitionHandler as createMetricDefinition } from "./features/definitions/create-metric-definition/handler";
export { updateMetricDefinitionHandler as updateMetricDefinition } from "./features/definitions/update-metric-definition/handler";
export { archiveMetricDefinitionHandler as archiveMetricDefinition } from "./features/definitions/archive-metric-definition/handler";
export { listMetricDefinitionsHandler as listMetricDefinitions } from "./features/definitions/list-metric-definitions/handler";

export type { CreateMetricDefinitionInput, CreateMetricDefinitionResult } from "./features/definitions/create-metric-definition/types";
export type { UpdateMetricDefinitionInput, UpdateMetricDefinitionResult } from "./features/definitions/update-metric-definition/types";
export type { ArchiveMetricDefinitionInput, ArchiveMetricDefinitionResult } from "./features/definitions/archive-metric-definition/types";
export type { ListMetricDefinitionsResult } from "./features/definitions/list-metric-definitions/types";

// Fase 2 — lançamento de valores
export { upsertMetricValueHandler as upsertMetricValue } from "./features/values/upsert-metric-value/handler";
export { listMetricValuesHandler as listMetricValues } from "./features/values/list-metric-values/handler";

export type { UpsertMetricValueInput, UpsertMetricValueResult } from "./features/values/upsert-metric-value/types";
export type { ListMetricValuesQuery, ListMetricValuesResult } from "./features/values/list-metric-values/types";

// Resumo de acesso do ator (quais setores configura/lança/vê)
export { getMyAccessHandler as getMyCompanyMetricsAccess } from "./features/access/get-my-access/handler";
export type { CompanyMetricsAccess, GetMyAccessResult } from "./features/access/get-my-access/types";

// Ponto de extensão "seeds" do plugin engine (platform/plugin-engine/plugin-seed-registry.ts).
export { companyMetricsSeeds } from "./seeds";
