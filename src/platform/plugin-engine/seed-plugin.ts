import { listExtensionStates } from "@/contexts/extensions";
import { authorizeActor } from "@/contexts/rbac";
import { beginOperation, endOperation, recordAuditEvent } from "@/observability";
import type { OperationResult } from "@/shared/types";
import { PLUGIN_REGISTRY } from "@/plugins/registry";
import { resolvePluginSeed } from "./plugin-seed-registry";

export type SeedPluginInput = { pluginKey: string; seedKey: string };

// Ponto de composição fora de contexts/ (docs/venore-docks.md — regra 12/14, mesmo motivo de
// clear-diagnostics-events-safely.ts): conhecer PLUGIN_REGISTRY + o registro de seeds é papel de
// platform/, e authorizeActor mora aqui, não num handler de context. Gateado por
// platform.extensions.manage (mesma permission de instalar/desabilitar plugin). A idempotência é
// responsabilidade da própria função de seed (list-then-skip) — aqui só orquestramos e auditamos.
export async function seedPlugin(command: SeedPluginInput): Promise<OperationResult<void>> {
  const authz = await authorizeActor("platform.extensions.manage");
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  const manifest = PLUGIN_REGISTRY.find((entry) => entry.key === command.pluginKey);
  if (!manifest) {
    return {
      success: false,
      error: {
        code: "plugin-engine.seed.unknown_plugin",
        message: `Plugin "${command.pluginKey}" não está no registro (src/plugins/registry.ts).`,
      },
    };
  }

  const states = await listExtensionStates({ kind: "plugin" });
  const installed = states.success && Boolean(states.data[command.pluginKey]?.installed);
  if (!installed) {
    return {
      success: false,
      error: {
        code: "plugin-engine.seed.not_installed",
        message: `Instale "${command.pluginKey}" antes de popular dados de exemplo.`,
      },
    };
  }

  const seedFn = resolvePluginSeed(command.pluginKey, command.seedKey);
  if (!seedFn) {
    return {
      success: false,
      error: {
        code: "plugin-engine.seed.unknown_seed",
        message: `Seed "${command.seedKey}" não existe para o plugin "${command.pluginKey}".`,
      },
    };
  }

  const handle = beginOperation({
    useCase: "platform.plugin-engine.seed-plugin",
    actor: { id: authz.actorId, type: "user" },
    kind: "write",
  });

  const result = await seedFn();

  const summary = result.success
    ? `Seed "${command.seedKey}" do plugin "${command.pluginKey}" aplicado.`
    : `Seed "${command.seedKey}" do plugin "${command.pluginKey}" falhou: ${result.error.message}`;

  endOperation(handle, result.success ? { success: true, summary } : { success: false, error: result.error, summary });

  await recordAuditEvent({
    action: "plugin-engine.seed-plugin",
    actor: { id: authz.actorId, type: "user" },
    outcome: result.success ? "success" : "failure",
    summary,
    detail: { pluginKey: command.pluginKey, seedKey: command.seedKey },
  });

  return result;
}
