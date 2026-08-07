import { getSetting } from "@/contexts/settings";
import { DEFAULT_DONATION_SETTINGS, DONATIONS_SETTINGS, type DonationSettingsValues } from "../../shared/settings";
import type { GetDonationSettingsResult } from "./types";

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number" && Number.isFinite(item));
}

type StringSettingKey = Exclude<keyof DonationSettingsValues, "suggestedAmounts">;

// Toda chave exceto suggestedAmounts é texto puro — lida em loop, não uma leitura por campo,
// porque a contagem só cresce (pedido explícito desta sessão: "nenhum texto deve ser hardcoded
// nos widgets", já são quinze+ campos de texto). Um novo campo em shared/settings.ts entra aqui
// automaticamente, sem precisar tocar neste arquivo.
const STRING_KEYS = Object.keys(DONATIONS_SETTINGS).filter((key) => key !== "suggestedAmounts") as StringSettingKey[];

export async function getDonationSettings(): Promise<GetDonationSettingsResult> {
  const [suggestedAmountsResult, ...stringResults] = await Promise.all([
    getSetting({ key: DONATIONS_SETTINGS.suggestedAmounts.key }),
    ...STRING_KEYS.map((field) => getSetting({ key: DONATIONS_SETTINGS[field].key })),
  ]);

  const data = {
    suggestedAmounts:
      suggestedAmountsResult.success && isNumberArray(suggestedAmountsResult.data?.value)
        ? suggestedAmountsResult.data.value
        : DEFAULT_DONATION_SETTINGS.suggestedAmounts,
  } as DonationSettingsValues;

  STRING_KEYS.forEach((field, index) => {
    const result = stringResults[index];
    data[field] = result.success && typeof result.data?.value === "string" ? result.data.value : DEFAULT_DONATION_SETTINGS[field];
  });

  return { success: true, data };
}
