import { getDonationSettings } from "./service";
import type { GetDonationSettingsResult } from "./types";

// Sem authorizeActor de propósito — lido tanto pela tela admin quanto pela página/bloco público de
// doações, mesmo padrão de get-birthday-appearance/handler.ts (src/plugins/birthdays).
export async function getDonationSettingsHandler(): Promise<GetDonationSettingsResult> {
  return getDonationSettings();
}
