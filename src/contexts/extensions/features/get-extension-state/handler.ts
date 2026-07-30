// Leitura pública, sem authorizeActor: consultada em caminhos que precisam funcionar sem sessão
// (ex: registerPlugins no bootstrap, resolução de tema para visitante anônimo) — mesmo espírito
// de contexts/settings/features/get-setting/handler.ts.
import { getExtensionState } from "./service";
import type { GetExtensionStateQuery, GetExtensionStateResult } from "./types";

export async function getExtensionStateHandler(query: GetExtensionStateQuery): Promise<GetExtensionStateResult> {
  if (query.key.trim().length === 0) {
    return { success: false, error: { code: "extensions.get.invalid_key", message: "key não pode ser vazio." } };
  }
  return getExtensionState(query);
}
