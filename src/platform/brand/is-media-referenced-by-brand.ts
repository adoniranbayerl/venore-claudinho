import { getSetting } from "@/contexts/settings";
import type { OperationResult } from "@/shared/types";
import { BRAND_SETTING_KEYS } from "./get-brand-config";

export type IsMediaReferencedByBrandInput = { mediaId: string };

// Mesmo papel de contexts/cms/features/entries/is-media-referenced, só que pro domínio brand
// (logo, logo-scrolled, favicon) — checado por delete-media-safely.ts antes de apagar mídia.
export async function isMediaReferencedByBrand(
  input: IsMediaReferencedByBrandInput,
): Promise<OperationResult<boolean>> {
  const keys = [BRAND_SETTING_KEYS.logoMediaId, BRAND_SETTING_KEYS.logoScrolledMediaId, BRAND_SETTING_KEYS.faviconMediaId];

  for (const key of keys) {
    const result = await getSetting({ key });
    if (!result.success) {
      return result;
    }
    if (result.data && result.data.value === input.mediaId) {
      return { success: true, data: true };
    }
  }

  return { success: true, data: false };
}
