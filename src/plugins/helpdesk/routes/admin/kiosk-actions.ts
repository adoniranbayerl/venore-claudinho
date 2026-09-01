"use server";

import { revalidatePath } from "next/cache";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
import { createKiosk, updateKiosk } from "@/plugins/helpdesk";

export type HelpdeskKioskActionState = { error: string | null };

const RETURN_TO = "/admin/helpdesk";
const PLUGIN_DISABLED_ERROR = "O plugin Chamados está desabilitado.";

function optional(formData: FormData, name: string): string | undefined {
  const value = String(formData.get(name) ?? "").trim();
  return value.length > 0 ? value : undefined;
}

export async function createKioskAction(
  _prev: HelpdeskKioskActionState,
  formData: FormData,
): Promise<HelpdeskKioskActionState> {
  if (!(await isPluginActive("helpdesk"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await createKiosk({
    label: String(formData.get("label") ?? ""),
    queueId: optional(formData, "queueId") ?? null,
    defaultLocation: optional(formData, "defaultLocation") ?? null,
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}

export async function updateKioskAction(
  _prev: HelpdeskKioskActionState,
  formData: FormData,
): Promise<HelpdeskKioskActionState> {
  if (!(await isPluginActive("helpdesk"))) return { error: PLUGIN_DISABLED_ERROR };

  const result = await updateKiosk({
    kioskId: String(formData.get("kioskId") ?? ""),
    label: String(formData.get("label") ?? ""),
    queueId: optional(formData, "queueId") ?? null,
    defaultLocation: optional(formData, "defaultLocation") ?? null,
    active: String(formData.get("active") ?? "") === "true",
  });
  if (!result.success) return { error: result.error.message };

  revalidatePath(RETURN_TO);
  return { error: null };
}
