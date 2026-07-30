"use server";

import { revalidatePath } from "next/cache";
import { togglePluginEnabled } from "@/platform/plugin-engine/toggle-plugin-enabled";

export type PluginsActionState = { error: string | null };

// Mesmo padrão de activateThemeAction (/admin/themes/actions.ts): erro do handler é devolvido de
// verdade via useActionState, nunca descartado silenciosamente (docs/venore-docks.md).
export async function togglePluginEnabledAction(
  _prevState: PluginsActionState,
  formData: FormData,
): Promise<PluginsActionState> {
  const pluginKey = String(formData.get("pluginKey") ?? "");
  const enabled = formData.get("enabled") === "true";

  const result = await togglePluginEnabled({ pluginKey, enabled });
  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/plugins");
  return { error: null };
}
