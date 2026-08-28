"use server";

import { revalidatePath } from "next/cache";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
import {
  archiveMetricDefinition,
  archiveSector,
  createMetricDefinition,
  createSector,
  createSectorGroup,
  createTarget,
  deleteSectorGroup,
  deleteTarget,
  setSectorMembers,
  updateMetricDefinition,
  updateSector,
  updateSectorGroup,
  updateTarget,
  upsertMetricValue,
  type SectorMemberAssignment,
  type TargetInputDraft,
} from "@/plugins/company-metrics";
import {
  METRIC_AGGREGATIONS,
  METRIC_DEFINITION_GRANULARITIES,
  METRIC_DIRECTIONS,
  METRIC_UNITS,
  SECTOR_MEMBER_ROLES,
  TARGET_CLASSIFICATIONS,
  type MetricAggregation,
  type MetricDefinitionGranularity,
  type MetricDirection,
  type MetricUnit,
  type SectorMemberRole,
  type TargetClassification,
} from "@/plugins/company-metrics/contracts/types";

export type CompanyMetricsActionState = { error: string | null };

const RETURN_TO = "/admin/company-metrics";
const PLUGIN_DISABLED_ERROR = "O plugin Métricas Internas está desabilitado.";

function optional(formData: FormData, name: string): string | undefined {
  const value = String(formData.get(name) ?? "").trim();
  return value.length > 0 ? value : undefined;
}

// Selects do Radix não aceitam value="" — "none" é o placeholder de "sem grupo".
function optionalRef(formData: FormData, name: string): string | undefined {
  const value = optional(formData, name);
  return value && value !== "none" ? value : undefined;
}

export async function createSectorAction(
  _prev: CompanyMetricsActionState,
  formData: FormData,
): Promise<CompanyMetricsActionState> {
  if (!(await isPluginActive("company-metrics"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await createSector({
    name: String(formData.get("name") ?? ""),
    description: optional(formData, "description") ?? null,
    icon: optional(formData, "icon") ?? null,
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}

export async function updateSectorAction(
  _prev: CompanyMetricsActionState,
  formData: FormData,
): Promise<CompanyMetricsActionState> {
  if (!(await isPluginActive("company-metrics"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await updateSector({
    sectorId: String(formData.get("sectorId") ?? ""),
    name: String(formData.get("name") ?? ""),
    description: optional(formData, "description") ?? null,
    icon: optional(formData, "icon") ?? null,
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}

export async function archiveSectorAction(
  _prev: CompanyMetricsActionState,
  formData: FormData,
): Promise<CompanyMetricsActionState> {
  if (!(await isPluginActive("company-metrics"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await archiveSector({
    sectorId: String(formData.get("sectorId") ?? ""),
    archived: String(formData.get("archived") ?? "") === "true",
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}

// members chega como JSON [{ userId, role }] num input hidden — o cliente monta a lista com
// pickers (sem UUID digitado). Linha inválida vira erro de validação no service.
function parseMembers(raw: string): SectorMemberAssignment[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw || "[]");
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((entry): entry is { userId: string; role: string } => {
      return Boolean(entry) && typeof entry === "object" && "userId" in entry && "role" in entry;
    })
    .map((entry) => ({
      userId: String(entry.userId),
      role: (SECTOR_MEMBER_ROLES as readonly string[]).includes(entry.role) ? (entry.role as SectorMemberRole) : "viewer",
    }));
}

export async function setSectorMembersAction(
  _prev: CompanyMetricsActionState,
  formData: FormData,
): Promise<CompanyMetricsActionState> {
  if (!(await isPluginActive("company-metrics"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await setSectorMembers({
    sectorId: String(formData.get("sectorId") ?? ""),
    members: parseMembers(String(formData.get("membersJson") ?? "[]")),
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}

export async function createSectorGroupAction(
  _prev: CompanyMetricsActionState,
  formData: FormData,
): Promise<CompanyMetricsActionState> {
  if (!(await isPluginActive("company-metrics"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await createSectorGroup({
    sectorId: String(formData.get("sectorId") ?? ""),
    label: String(formData.get("label") ?? ""),
    logoMediaId: optional(formData, "logoMediaId") ?? null,
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}

export async function updateSectorGroupAction(
  _prev: CompanyMetricsActionState,
  formData: FormData,
): Promise<CompanyMetricsActionState> {
  if (!(await isPluginActive("company-metrics"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await updateSectorGroup({
    groupId: String(formData.get("groupId") ?? ""),
    label: String(formData.get("label") ?? ""),
    logoMediaId: optional(formData, "logoMediaId") ?? null,
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}

export async function deleteSectorGroupAction(
  _prev: CompanyMetricsActionState,
  formData: FormData,
): Promise<CompanyMetricsActionState> {
  if (!(await isPluginActive("company-metrics"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await deleteSectorGroup({ groupId: String(formData.get("groupId") ?? "") });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}

// --- Fase 2: definições de métrica ---

function pick<T extends string>(formData: FormData, name: string, allowed: readonly T[], fallback: T): T {
  const value = String(formData.get(name) ?? "");
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

export async function createMetricDefinitionAction(
  _prev: CompanyMetricsActionState,
  formData: FormData,
): Promise<CompanyMetricsActionState> {
  if (!(await isPluginActive("company-metrics"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await createMetricDefinition({
    sectorId: String(formData.get("sectorId") ?? ""),
    groupId: optionalRef(formData, "groupId") ?? null,
    label: String(formData.get("label") ?? ""),
    description: optional(formData, "description") ?? null,
    unit: pick<MetricUnit>(formData, "unit", METRIC_UNITS, "count"),
    aggregation: pick<MetricAggregation>(formData, "aggregation", METRIC_AGGREGATIONS, "sum"),
    granularity: pick<MetricDefinitionGranularity>(formData, "granularity", METRIC_DEFINITION_GRANULARITIES, "monthly"),
    direction: pick<MetricDirection>(formData, "direction", METRIC_DIRECTIONS, "up_good"),
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}

export async function updateMetricDefinitionAction(
  _prev: CompanyMetricsActionState,
  formData: FormData,
): Promise<CompanyMetricsActionState> {
  if (!(await isPluginActive("company-metrics"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await updateMetricDefinition({
    definitionId: String(formData.get("definitionId") ?? ""),
    label: String(formData.get("label") ?? ""),
    description: optional(formData, "description") ?? null,
    groupId: optionalRef(formData, "groupId") ?? null,
    unit: pick<MetricUnit>(formData, "unit", METRIC_UNITS, "count"),
    direction: pick<MetricDirection>(formData, "direction", METRIC_DIRECTIONS, "up_good"),
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}

export async function archiveMetricDefinitionAction(
  _prev: CompanyMetricsActionState,
  formData: FormData,
): Promise<CompanyMetricsActionState> {
  if (!(await isPluginActive("company-metrics"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await archiveMetricDefinition({
    definitionId: String(formData.get("definitionId") ?? ""),
    archived: String(formData.get("archived") ?? "") === "true",
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}

// --- Fase 2: lançamento de valores ---

export async function upsertMetricValueAction(
  _prev: CompanyMetricsActionState,
  formData: FormData,
): Promise<CompanyMetricsActionState> {
  if (!(await isPluginActive("company-metrics"))) return { error: PLUGIN_DISABLED_ERROR };

  const raw = String(formData.get("value") ?? "").trim().replace(",", ".");
  const value = raw.length === 0 ? null : Number(raw);

  const result = await upsertMetricValue({
    definitionId: String(formData.get("definitionId") ?? ""),
    periodDate: String(formData.get("periodDate") ?? ""),
    value,
    note: optional(formData, "note") ?? null,
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}

// --- Fase 3: metas e composição ---

function num(formData: FormData, name: string): number {
  return Number(String(formData.get(name) ?? "").trim().replace(",", "."));
}

// A composição chega como JSON [{ definitionId, weight, classification }] de um input hidden.
function parseComposition(raw: string): TargetInputDraft[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw || "[]");
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter(
      (entry): entry is { definitionId: unknown; weight: unknown; classification: unknown } =>
        Boolean(entry) && typeof entry === "object",
    )
    .map((entry) => ({
      definitionId: String(entry.definitionId ?? ""),
      weight: Number(entry.weight),
      classification: (TARGET_CLASSIFICATIONS as readonly string[]).includes(String(entry.classification))
        ? (String(entry.classification) as TargetClassification)
        : ("realized" as TargetClassification),
    }));
}

export async function createTargetAction(
  _prev: CompanyMetricsActionState,
  formData: FormData,
): Promise<CompanyMetricsActionState> {
  if (!(await isPluginActive("company-metrics"))) return { error: PLUGIN_DISABLED_ERROR };

  const thresholdRaw = optional(formData, "onTrackThreshold");
  const result = await createTarget({
    sectorId: String(formData.get("sectorId") ?? ""),
    groupId: optionalRef(formData, "groupId") ?? null,
    label: String(formData.get("label") ?? ""),
    description: optional(formData, "description") ?? null,
    targetValue: num(formData, "targetValue"),
    periodStart: String(formData.get("periodStart") ?? ""),
    periodEnd: String(formData.get("periodEnd") ?? ""),
    onTrackThreshold: thresholdRaw ? Number(thresholdRaw.replace(",", ".")) : undefined,
    inputs: parseComposition(String(formData.get("compositionJson") ?? "[]")),
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}

export async function updateTargetAction(
  _prev: CompanyMetricsActionState,
  formData: FormData,
): Promise<CompanyMetricsActionState> {
  if (!(await isPluginActive("company-metrics"))) return { error: PLUGIN_DISABLED_ERROR };

  const thresholdRaw = optional(formData, "onTrackThreshold");
  const result = await updateTarget({
    targetId: String(formData.get("targetId") ?? ""),
    groupId: optionalRef(formData, "groupId") ?? null,
    label: String(formData.get("label") ?? ""),
    description: optional(formData, "description") ?? null,
    targetValue: num(formData, "targetValue"),
    periodStart: String(formData.get("periodStart") ?? ""),
    periodEnd: String(formData.get("periodEnd") ?? ""),
    onTrackThreshold: thresholdRaw ? Number(thresholdRaw.replace(",", ".")) : 0.85,
    inputs: parseComposition(String(formData.get("compositionJson") ?? "[]")),
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}

export async function deleteTargetAction(
  _prev: CompanyMetricsActionState,
  formData: FormData,
): Promise<CompanyMetricsActionState> {
  if (!(await isPluginActive("company-metrics"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await deleteTarget({ targetId: String(formData.get("targetId") ?? "") });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}
