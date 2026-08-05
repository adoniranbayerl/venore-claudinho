import { buildDonationPixCode } from "./service";
import { normalizeAmount } from "./validation";
import type { BuildDonationPixCodeInput, BuildDonationPixCodeResult } from "./types";

// Público, sem authorizeActor — o doador não loga (v1 anônimo, sem cadastro), mesmo espírito de
// get-donation-settings/handler.ts.
export async function buildDonationPixCodeHandler(input: BuildDonationPixCodeInput): Promise<BuildDonationPixCodeResult> {
  const normalized = normalizeAmount(input.amount);
  if (normalized.error) {
    return { success: false, error: normalized.error };
  }

  return buildDonationPixCode({ amount: normalized.amount });
}
