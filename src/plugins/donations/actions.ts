"use server";

import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
import { buildDonationPixCodeHandler } from "./features/build-donation-pix-code/handler";
import type { BuildDonationPixCodeResult } from "./features/build-donation-pix-code/types";

// Mora dentro do plugin (não em app/(platform)/donations/actions.ts) porque é chamada tanto pela
// página pública quanto pelo block "donations.pix-widget" embutido em páginas CMS arbitrárias via
// page-builder — os dois precisam do mesmo ponto de entrada pra regenerar o QR com um valor
// diferente, e duplicar esse wrapper por ponto de uso criaria dois caminhos pra mesma regra (ver
// docs do plano desta sessão). Checa isPluginActive aqui porque é invocável direto (Server Action),
// sem passar pelo gate de página que renderiza o widget pela primeira vez.
export async function generateDonationPixCodeAction(amount: number | null): Promise<BuildDonationPixCodeResult> {
  if (!(await isPluginActive("donations"))) {
    return { success: false, error: { code: "donations.plugin_disabled", message: "O plugin Doações está desabilitado." } };
  }

  return buildDonationPixCodeHandler({ amount });
}
