// Sem authorizeActor de propósito: não é uma escrita disparada por um admin autenticado — é o
// motor de plugin (platform/plugin-engine) registrando o defaultValue declarado no manifesto no
// bootstrap, sem ator humano. INSERT ... ON CONFLICT DO NOTHING no store garante que isso nunca
// sobrescreve um valor já configurado por um admin via setSetting.
import { registerDefaultSetting } from "./service";
import type { RegisterDefaultSettingInput, RegisterDefaultSettingResult } from "./types";

export async function registerDefaultSettingHandler(input: RegisterDefaultSettingInput): Promise<RegisterDefaultSettingResult> {
  if (input.key.trim().length === 0) {
    return {
      success: false,
      error: { code: "settings.register_default.invalid_key", message: "key não pode ser vazio." },
    };
  }

  return registerDefaultSetting(input);
}
