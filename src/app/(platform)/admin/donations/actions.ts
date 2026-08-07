"use server";

import { revalidatePath } from "next/cache";
import { setSetting } from "@/contexts/settings";
import { DONATIONS_SETTINGS, validateDonationSettingsInput, type DonationSettingsFormInput } from "@/plugins/donations";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";

export type DonationsSettingsActionState = { error: string | null };

const returnTo = "/admin/donations";

const SETTINGS_FIELDS = Object.keys(DONATIONS_SETTINGS) as (keyof typeof DONATIONS_SETTINGS)[];

// Checagem de plugin ativo: invocável direto, sem passar pelo gate da página
// (get-donations-page-data.ts) que a renderiza — mesmo padrão de updateBirthdaysAppearanceAction.
export async function updateDonationSettingsAction(
  _prevState: DonationsSettingsActionState,
  formData: FormData,
): Promise<DonationsSettingsActionState> {
  if (!(await isPluginActive("donations"))) {
    return { error: "O plugin Doações está desabilitado." };
  }

  // FormData entrega tudo como string (inclusive suggestedAmounts, parseado dentro da validação)
  // — um campo por chave de DONATIONS_SETTINGS, sem lista manual pra manter em dia.
  const input = Object.fromEntries(SETTINGS_FIELDS.map((field) => [field, String(formData.get(field) ?? "")])) as DonationSettingsFormInput;

  const validation = validateDonationSettingsInput(input);
  if (validation.error) {
    return { error: validation.error.message };
  }

  // Cada chave é independente (contexts/settings não tem transação multi-chave) — mesmo padrão de
  // updateBirthdaysAppearanceAction. setSetting exige "settings.manage" internamente (não
  // "donations.manage"): getDonationsPageData já garantiu que quem chega aqui pode VER a tela,
  // GRAVAR passa pela permission do contexts/settings, único ponto de acesso a esse dado.
  for (const field of SETTINGS_FIELDS) {
    const result = await setSetting({ key: DONATIONS_SETTINGS[field].key, value: validation.data[field] });
    if (!result.success) {
      return { error: result.error.message };
    }
  }

  revalidatePath(returnTo);
  return { error: null };
}
