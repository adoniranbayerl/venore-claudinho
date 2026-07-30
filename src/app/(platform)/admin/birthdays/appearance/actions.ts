"use server";

import { revalidatePath } from "next/cache";
import { setSetting } from "@/contexts/settings";
import { BIRTHDAY_APPEARANCE_SETTINGS, type BirthdayAppearanceField } from "@/plugins/birthdays";

export type BirthdaysAppearanceActionState = { error: string | null };

const returnTo = "/admin/birthdays/appearance";

// Cada chave é independente (contexts/settings não tem transação multi-chave), mesmo padrão de
// updateBrandSettingsAction (admin/settings/appearance/actions.ts) — para no primeiro erro.
export async function updateBirthdaysAppearanceAction(
  _prevState: BirthdaysAppearanceActionState,
  formData: FormData,
): Promise<BirthdaysAppearanceActionState> {
  const fields = Object.keys(BIRTHDAY_APPEARANCE_SETTINGS) as BirthdayAppearanceField[];

  for (const field of fields) {
    const { key } = BIRTHDAY_APPEARANCE_SETTINGS[field];
    const result = await setSetting({ key, value: String(formData.get(field) ?? "") });
    if (!result.success) {
      return { error: result.error.message };
    }
  }

  revalidatePath(returnTo);
  return { error: null };
}
