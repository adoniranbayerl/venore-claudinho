import { getSetting } from "@/contexts/settings";
import { DEFAULT_DONATION_SETTINGS, DONATIONS_SETTINGS } from "../../shared/settings";
import type { GetDonationSettingsResult } from "./types";

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number" && Number.isFinite(item));
}

function readStringSetting(
  result: Awaited<ReturnType<typeof getSetting>>,
  fallback: string,
): string {
  return result.success && typeof result.data?.value === "string" ? result.data.value : fallback;
}

export async function getDonationSettings(): Promise<GetDonationSettingsResult> {
  const [
    pixKey,
    recipientName,
    recipientCity,
    suggestedAmounts,
    title,
    message,
    academyCatalogTitle,
    academyCourseTitle,
    academySidebarTitle,
    academyCtaLabel,
    academyLessonIntro,
  ] = await Promise.all([
    getSetting({ key: DONATIONS_SETTINGS.pixKey.key }),
    getSetting({ key: DONATIONS_SETTINGS.recipientName.key }),
    getSetting({ key: DONATIONS_SETTINGS.recipientCity.key }),
    getSetting({ key: DONATIONS_SETTINGS.suggestedAmounts.key }),
    getSetting({ key: DONATIONS_SETTINGS.title.key }),
    getSetting({ key: DONATIONS_SETTINGS.message.key }),
    getSetting({ key: DONATIONS_SETTINGS.academyCatalogTitle.key }),
    getSetting({ key: DONATIONS_SETTINGS.academyCourseTitle.key }),
    getSetting({ key: DONATIONS_SETTINGS.academySidebarTitle.key }),
    getSetting({ key: DONATIONS_SETTINGS.academyCtaLabel.key }),
    getSetting({ key: DONATIONS_SETTINGS.academyLessonIntro.key }),
  ]);

  return {
    success: true,
    data: {
      pixKey: readStringSetting(pixKey, DEFAULT_DONATION_SETTINGS.pixKey),
      recipientName: readStringSetting(recipientName, DEFAULT_DONATION_SETTINGS.recipientName),
      recipientCity: readStringSetting(recipientCity, DEFAULT_DONATION_SETTINGS.recipientCity),
      suggestedAmounts:
        suggestedAmounts.success && isNumberArray(suggestedAmounts.data?.value)
          ? suggestedAmounts.data.value
          : DEFAULT_DONATION_SETTINGS.suggestedAmounts,
      title: readStringSetting(title, DEFAULT_DONATION_SETTINGS.title),
      message: readStringSetting(message, DEFAULT_DONATION_SETTINGS.message),
      academyCatalogTitle: readStringSetting(academyCatalogTitle, DEFAULT_DONATION_SETTINGS.academyCatalogTitle),
      academyCourseTitle: readStringSetting(academyCourseTitle, DEFAULT_DONATION_SETTINGS.academyCourseTitle),
      academySidebarTitle: readStringSetting(academySidebarTitle, DEFAULT_DONATION_SETTINGS.academySidebarTitle),
      academyCtaLabel: readStringSetting(academyCtaLabel, DEFAULT_DONATION_SETTINGS.academyCtaLabel),
      academyLessonIntro: readStringSetting(academyLessonIntro, DEFAULT_DONATION_SETTINGS.academyLessonIntro),
    },
  };
}
