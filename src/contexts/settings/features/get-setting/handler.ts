// Leitura pública: usada por qualquer parte do sistema, inclusive sem sessão (ex: resolver o
// tema ativo para um visitante anônimo) — sem authorizeActor.
import { getSetting } from "./service";
import type { GetSettingQuery, GetSettingResult } from "./types";

export async function getSettingHandler(query: GetSettingQuery): Promise<GetSettingResult> {
  if (query.key.trim().length === 0) {
    return { success: false, error: { code: "settings.get.invalid_key", message: "key não pode ser vazio." } };
  }
  return getSetting(query);
}
