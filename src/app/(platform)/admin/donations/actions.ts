"use server";

import { revalidatePath } from "next/cache";
import { setSetting } from "@/contexts/settings";
import { DONATIONS_SETTINGS, validateDonationSettingsInput, type DonationSettingsFormInput } from "@/plugins/donations";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";

export type DonationsSettingsActionState = { error: string | null };

const returnTo = "/admin/donations";

// Checagem de plugin ativo: invocável direto, sem passar pelo gate da página
// (get-donations-page-data.ts) que a renderiza — mesmo padrão de updateBirthdaysAppearanceAction.
export async function updateDonationSettingsAction(
  _prevState: DonationsSettingsActionState,
  formData: FormData,
): Promise<DonationsSettingsActionState> {
  if (!(await isPluginActive("donations"))) {
    return { error: "O plugin Doações está desabilitado." };
  }

  const input: DonationSettingsFormInput = {
    pixKey: String(formData.get("pixKey") ?? ""),
    recipientName: String(formData.get("recipientName") ?? ""),
    recipientCity: String(formData.get("recipientCity") ?? ""),
    suggestedAmounts: String(formData.get("suggestedAmounts") ?? ""),
    title: String(formData.get("title") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const validation = validateDonationSettingsInput(input);
  if (validation.error) {
    return { error: validation.error.message };
  }

  const writes: [string, unknown][] = [
    [DONATIONS_SETTINGS.pixKey.key, validation.data.pixKey],
    [DONATIONS_SETTINGS.recipientName.key, validation.data.recipientName],
    [DONATIONS_SETTINGS.recipientCity.key, validation.data.recipientCity],
    [DONATIONS_SETTINGS.suggestedAmounts.key, validation.data.suggestedAmounts],
    [DONATIONS_SETTINGS.title.key, validation.data.title],
    [DONATIONS_SETTINGS.message.key, validation.data.message],
  ];

  // Cada chave é independente (contexts/settings não tem transação multi-chave) — mesmo padrão de
  // updateBirthdaysAppearanceAction. setSetting exige "settings.manage" internamente (não
  // "donations.manage"): getDonationsPageData já garantiu que quem chega aqui pode VER a tela,
  // GRAVAR passa pela permission do contexts/settings, único ponto de acesso a esse dado.
  for (const [key, value] of writes) {
    const result = await setSetting({ key, value });
    if (!result.success) {
      return { error: result.error.message };
    }
  }

  revalidatePath(returnTo);
  return { error: null };
}
