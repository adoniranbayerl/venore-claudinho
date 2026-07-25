"use server";

import { revalidatePath } from "next/cache";
import { activateTheme, CURRENT_THEME_CONTRACT_VERSION } from "@/contexts/themes";

export type ThemesActionState = { error: string | null };

// Mesmo padrão de removeRoleAction (/admin/rbac/actions.ts): erro do handler é devolvido de
// verdade via useActionState, nunca descartado silenciosamente (docs/venore-docks.md).
export async function activateThemeAction(
  _prevState: ThemesActionState,
  formData: FormData,
): Promise<ThemesActionState> {
  const themeKey = String(formData.get("themeKey") ?? "");

  const result = await activateTheme({ themeKey, themeContractVersion: CURRENT_THEME_CONTRACT_VERSION });

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/admin/themes");
  return { error: null };
}
