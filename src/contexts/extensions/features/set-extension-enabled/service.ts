import { invalidateCache } from "@/infrastructure/cache/memory-cache";
import { beginOperation, endOperation } from "@/observability";
import { extensionStateCacheKeyFor } from "../get-extension-state/service";
import { listExtensionStatesCacheKeyFor } from "../list-extension-states/service";
import { upsertExtensionState } from "./store";
import type { SetExtensionEnabledCommand, SetExtensionEnabledResult } from "./types";

// Persistência pura do estado liga/desliga (auth + auditoria de "quem pediu a troca"). As
// invariantes de negócio (plugin com dependente habilitado, tema ativo, último tema) são
// checadas ANTES de chamar este service, em platform/ (que é quem conhece PLUGIN_REGISTRY e
// THEME_REGISTRY) — este context não sabe o que existe além da própria chave.
export async function setExtensionEnabled(command: SetExtensionEnabledCommand): Promise<SetExtensionEnabledResult> {
  const handle = beginOperation({
    useCase: `extensions.set-extension-enabled.${command.kind}`,
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const record = await upsertExtensionState(command.kind, command.key, command.enabled, command.actorId);

  // Invalidação é responsabilidade de quem escreve (docs/venore-docks.md — Cache): tanto a
  // leitura pontual quanto a listagem por tipo ficam obsoletas com a troca.
  invalidateCache(extensionStateCacheKeyFor(command.kind, command.key));
  invalidateCache(listExtensionStatesCacheKeyFor(command.kind));

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
