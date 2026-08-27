import { invalidateCache } from "@/infrastructure/cache/memory-cache";
import type { ExtensionKind } from "./contracts/types";
import { extensionStateCacheKeyFor } from "./features/get-extension-state/service";
import { listExtensionStatesCacheKeyFor } from "./features/list-extension-states/service";

// Invalida os dois caches de leitura de estado de extensão (leitura pontual + listagem por
// kind). Os handlers/services deste context já fazem isso internamente a cada escrita; este
// helper existe para o único ponto de composição que muta `extensions.extension_state` FORA dos
// handlers — src/platform/plugin-engine/uninstall-plugin.ts, que precisa do UPDATE de "não
// instalado" na MESMA transação do DROP SCHEMA do plugin e da limpeza de settings/rbac
// (atomicidade que uma chamada de handler separada quebraria). Ver AGENTS.md — regra 12.
export function invalidateExtensionStateCaches(kind: ExtensionKind, key: string): void {
  invalidateCache(extensionStateCacheKeyFor(kind, key));
  invalidateCache(listExtensionStatesCacheKeyFor(kind));
}
