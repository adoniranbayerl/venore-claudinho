"use server";

import { revalidatePath } from "next/cache";
import { setSetting } from "@/contexts/settings";
import { BRAND_SETTING_KEYS } from "@/platform/brand/get-brand-config";

export type BrandSettingsActionState = { error: string | null };

const returnTo = "/admin/settings/appearance";

// Mesmo padrão de updateRegistrationApprovalAction (/admin/settings/actions.ts): erro do handler
// é devolvido de verdade via useActionState, nunca descartado silenciosamente. Cada chave é
// independente (contexts/settings não tem transação multi-chave), então para no primeiro erro.
export async function updateBrandSettingsAction(
  _prevState: BrandSettingsActionState,
  formData: FormData,
): Promise<BrandSettingsActionState> {
  const entries: Array<{ key: string; value: unknown }> = [
    { key: BRAND_SETTING_KEYS.siteName, value: String(formData.get("siteName") ?? "") },
    { key: BRAND_SETTING_KEYS.headerMode, value: String(formData.get("headerMode") ?? "svg") },
    { key: BRAND_SETTING_KEYS.position, value: String(formData.get("position") ?? "left") },
    { key: BRAND_SETTING_KEYS.size, value: Number(formData.get("size")) },
    { key: BRAND_SETTING_KEYS.scrolledSize, value: Number(formData.get("scrolledSize")) },
    { key: BRAND_SETTING_KEYS.logoMediaId, value: String(formData.get("logoMediaId") ?? "") },
    { key: BRAND_SETTING_KEYS.logoScrolledMediaId, value: String(formData.get("logoScrolledMediaId") ?? "") },
    { key: BRAND_SETTING_KEYS.faviconMediaId, value: String(formData.get("faviconMediaId") ?? "") },
    { key: BRAND_SETTING_KEYS.footerDescription, value: String(formData.get("footerDescription") ?? "") },
  ];

  for (const entry of entries) {
    const result = await setSetting(entry);
    if (!result.success) {
      return { error: result.error.message };
    }
  }

  revalidatePath(returnTo);
  return { error: null };
}
