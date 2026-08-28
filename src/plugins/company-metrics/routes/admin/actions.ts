"use server";

import { revalidatePath } from "next/cache";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
import {
  archiveSector,
  createSector,
  createSectorGroup,
  deleteSectorGroup,
  setSectorMembers,
  updateSector,
  updateSectorGroup,
  type SectorMemberAssignment,
} from "@/plugins/company-metrics";
import { SECTOR_MEMBER_ROLES, type SectorMemberRole } from "@/plugins/company-metrics/contracts/types";

export type CompanyMetricsActionState = { error: string | null };

const RETURN_TO = "/admin/company-metrics";
const PLUGIN_DISABLED_ERROR = "O plugin Métricas Internas está desabilitado.";

function optional(formData: FormData, name: string): string | undefined {
  const value = String(formData.get(name) ?? "").trim();
  return value.length > 0 ? value : undefined;
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
