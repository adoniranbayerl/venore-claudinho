import { RBAC_PERMISSIONS } from "@/contexts/rbac";
import { registerDefaultSetting } from "@/contexts/settings";
import { beginOperation, endOperation } from "@/observability";
import { PLUGIN_REGISTRY } from "@/plugins/registry";
import { isCoreVersionCompatible } from "./check-compatibility";
import type { PluginManifest } from "./manifest-schema";
import { resolveDependencies } from "./resolve-dependencies";
import type { PluginRegistrationEntry, PluginRegistrationReport } from "./types";
import { validateManifest } from "./validate-manifest";

// Motor de plugins (docs/venore-docks.md — "Sistema de plugins"): lê os manifestos declarados em
// src/plugins/registry.ts, valida, checa compatibilidade de versão, resolve dependências e monta
// o relatório de registro. Roda no bootstrap, sem ator humano — por isso actor "system" no log,
// mesmo espírito de contexts/rbac/features/role-assignment/assign-default-role.
export async function registerPlugins(manifests: unknown[] = PLUGIN_REGISTRY): Promise<PluginRegistrationReport> {
  const handle = beginOperation({
    useCase: "platform.plugin-engine.register-plugins",
    actor: { id: "system", type: "system" },
    kind: "write",
  });

  const entries: PluginRegistrationEntry[] = [];
  const compatible: PluginManifest[] = [];

  for (const raw of manifests) {
    const validation = validateManifest(raw);
    if (!validation.valid) {
      entries.push({ key: validation.key, status: "invalid", errors: validation.errors });
      continue;
    }

    const { manifest } = validation;
    if (manifest.compatibility && !isCoreVersionCompatible(manifest.compatibility.coreVersion)) {
      entries.push({
        key: manifest.key,
        status: "incompatible",
        manifest,
        errors: [`coreVersion "${manifest.compatibility.coreVersion}" incompatível com o core atual.`],
      });
      continue;
    }

    compatible.push(manifest);
  }

  const resolution = resolveDependencies(compatible);
  const activePlugins: PluginManifest[] = [];

  for (const manifest of compatible) {
    const status = resolution[manifest.key];
    entries.push({ key: manifest.key, status: status.status, manifest, errors: status.errors });
    if (status.status === "active") {
      activePlugins.push(manifest);
    }
  }

  for (const plugin of activePlugins) {
    for (const setting of plugin.settings ?? []) {
      await registerDefaultSetting({ key: setting.key, value: setting.defaultValue });
    }
  }

  const report: PluginRegistrationReport = {
    entries,
    permissions: [...RBAC_PERMISSIONS, ...activePlugins.flatMap((plugin) => plugin.permissions ?? [])],
    navigation: activePlugins.flatMap((plugin) => plugin.navigation ?? []),
    routes: activePlugins.flatMap((plugin) => plugin.routes ?? []),
    contentTypes: activePlugins.flatMap((plugin) => plugin.contentTypes ?? []),
    blocks: activePlugins.flatMap((plugin) => plugin.blocks ?? []),
  };

  endOperation(handle, { success: true });
  return report;
}
