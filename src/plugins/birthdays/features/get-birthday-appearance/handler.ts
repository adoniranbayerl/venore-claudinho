import { getBirthdayAppearance } from "./service";
import type { GetBirthdayAppearanceResult } from "./types";

// Sem authorizeActor de propósito — a paleta é lida tanto pela tela admin de aparência quanto
// pelo quadro público (mesmo espírito de contexts/settings/features/get-setting/handler.ts).
export async function getBirthdayAppearanceHandler(): Promise<GetBirthdayAppearanceResult> {
  return getBirthdayAppearance();
}
