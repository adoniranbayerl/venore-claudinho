import { countUsersWithPermissions } from "@/contexts/rbac";
import { findEnabledDependents, type DependentPluginRef } from "./find-dependent-plugins";
import { registerPlugins } from "./register-plugins";

export type PluginDisablePreview = {
  pluginKey: string;
  pluginName: string;
  // Não-vazio == desabilitação bloqueada; a UI mostra o motivo em vez do diálogo de confirmação
  // (docs/venore-docks.md — "a mensagem diz QUEM depende").
  blockedByDependents: DependentPluginRef[];
  navigationLabels: string[];
  permissionLabels: string[];
  affectedUserCount: number;
};

// Consequências reais de desabilitar um plugin, pra enumerar no diálogo de confirmação antes de
// aplicar (docs/venore-docks.md — interface): quais itens de navegação somem, quais permissions
// deixam de existir, quantos usuários perdem acesso (via contexts/rbac, sem expor identidade).
export async function previewPluginDisable(pluginKey: string): Promise<PluginDisablePreview> {
  const report = await registerPlugins();
  const entry = report.entries.find((e) => e.key === pluginKey);
  const manifest = entry?.manifest;

  const permissionKeys = (manifest?.permissions ?? []).map((permission) => permission.key);
  const countResult = await countUsersWithPermissions({ permissionKeys });

  return {
    pluginKey,
    pluginName: manifest?.name ?? pluginKey,
    blockedByDependents: findEnabledDependents(pluginKey, report),
    navigationLabels: (manifest?.navigation ?? []).map((item) => item.label),
    permissionLabels: (manifest?.permissions ?? []).map((permission) => permission.label),
    affectedUserCount: countResult.success ? countResult.data : 0,
  };
}
