import { invalidateCache } from "@/infrastructure/cache/memory-cache";
import { beginOperation, endOperation } from "@/observability";
import { extensionStateCacheKeyFor } from "../get-extension-state/service";
import { listExtensionStatesCacheKeyFor } from "../list-extension-states/service";
import { upsertExtensionInstalled } from "./store";
import type { SetExtensionInstalledCommand, SetExtensionInstalledResult } from "./types";

// Persistência pura do "instalado" (auth + auditoria de "quem pediu"). Rodar as migrations do
// plugin, checar se a chave existe no PLUGIN_REGISTRY e invalidar o relatório do motor de
// plugins são responsabilidade de platform/plugin-engine/install-plugin.ts (que conhece o
// registro) — este context só sabe gravar a própria chave.
export async function setExtensionInstalled(command: SetExtensionInstalledCommand): Promise<SetExtensionInstalledResult> {
  const handle = beginOperation({
    useCase: `extensions.set-extension-installed.${command.kind}`,
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const record = await upsertExtensionInstalled(command.kind, command.key, command.actorId);

  invalidateCache(extensionStateCacheKeyFor(command.kind, command.key));
  invalidateCache(listExtensionStatesCacheKeyFor(command.kind));

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
