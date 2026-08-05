import { getSetting } from "@/contexts/settings";
import { DEFAULT_DONATION_SETTINGS, DONATIONS_SETTINGS } from "../../shared/settings";
import type { GetDonationSettingsResult } from "./types";

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number" && Number.isFinite(item));
}

export async function getDonationSettings(): Promise<GetDonationSettingsResult> {
  const [pixKey, recipientName, recipientCity, suggestedAmounts, title, message] = await Promise.all([
    getSetting({ key: DONATIONS_SETTINGS.pixKey.key }),
    getSetting({ key: DONATIONS_SETTINGS.recipientName.key }),
    getSetting({ key: DONATIONS_SETTINGS.recipientCity.key }),
    getSetting({ key: DONATIONS_SETTINGS.suggestedAmounts.key }),
    getSetting({ key: DONATIONS_SETTINGS.title.key }),
    getSetting({ key: DONATIONS_SETTINGS.message.key }),
  ]);

  return {
    success: true,
    data: {
      pixKey: pixKey.success && typeof pixKey.data?.value === "string" ? pixKey.data.value : DEFAULT_DONATION_SETTINGS.pixKey,
      recipientName:
        recipientName.success && typeof recipientName.data?.value === "string"
          ? recipientName.data.value
          : DEFAULT_DONATION_SETTINGS.recipientName,
      recipientCity:
        recipientCity.success && typeof recipientCity.data?.value === "string"
          ? recipientCity.data.value
          : DEFAULT_DONATION_SETTINGS.recipientCity,
      suggestedAmounts:
        suggestedAmounts.success && isNumberArray(suggestedAmounts.data?.value)
          ? suggestedAmounts.data.value
          : DEFAULT_DONATION_SETTINGS.suggestedAmounts,
      title: title.success && typeof title.data?.value === "string" ? title.data.value : DEFAULT_DONATION_SETTINGS.title,
      message: message.success && typeof message.data?.value === "string" ? message.data.value : DEFAULT_DONATION_SETTINGS.message,
    },
  };
}
