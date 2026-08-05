import QRCode from "qrcode";
import { getDonationSettings } from "../get-donation-settings/service";
import { buildPixBrCodePayload } from "../../shared/pix-br-code";
import type { BuildDonationPixCodeResult } from "./types";

export async function buildDonationPixCode({ amount }: { amount: number | null }): Promise<BuildDonationPixCodeResult> {
  const settingsResult = await getDonationSettings();
  if (!settingsResult.success) {
    return settingsResult;
  }

  const { pixKey, recipientName, recipientCity } = settingsResult.data;
  if (!pixKey || !recipientName || !recipientCity) {
    return {
      success: false,
      error: { code: "donations.not_configured", message: "A doação ainda não foi configurada pelo administrador." },
    };
  }

  const payload = buildPixBrCodePayload({ pixKey, merchantName: recipientName, merchantCity: recipientCity, amount });
  const qrSvg = await QRCode.toString(payload, { type: "svg", margin: 1 });

  return { success: true, data: { payload, qrSvg, amount } };
}
