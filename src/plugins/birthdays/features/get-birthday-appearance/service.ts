import { getSetting } from "@/contexts/settings";
import { BIRTHDAY_APPEARANCE_SETTINGS, type BirthdayAppearanceField, type BirthdayAppearanceSettings } from "../../shared/appearance";
import type { GetBirthdayAppearanceResult } from "./types";

export async function getBirthdayAppearance(): Promise<GetBirthdayAppearanceResult> {
  const entries = Object.entries(BIRTHDAY_APPEARANCE_SETTINGS) as [
    BirthdayAppearanceField,
    (typeof BIRTHDAY_APPEARANCE_SETTINGS)[BirthdayAppearanceField],
  ][];

  const results = await Promise.all(
    entries.map(async ([field, { key, defaultValue }]) => {
      const result = await getSetting({ key });
      const value = result.success && typeof result.data?.value === "string" ? result.data.value : defaultValue;
      return [field, value] as const;
    }),
  );

  return { success: true, data: Object.fromEntries(results) as BirthdayAppearanceSettings };
}
