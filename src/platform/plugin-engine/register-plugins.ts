import { RBAC_PERMISSIONS } from "@/contexts/rbac";
import { registerDefaultSetting } from "@/contexts/settings";
import { listExtensionStates } from "@/contexts/extensions";
import { getCache, setCache } from "@/infrastructure/cache/memory-cache";
import { beginOperation, endOperation } from "@/observability";
import { PLUGIN_REGISTRY } from "@/plugins/registry";
import { isCoreVersionCompatible } from "./check-compatibility";
import type { PluginManifest } from "./manifest-schema";
import { resolveDependencies } from "./resolve-dependencies";
import type { PluginRegistrationEntry, PluginRegistrationReport } from "./types";
import { validateManifest } from "./validate-manifest";

// Cache só se aplica à chamada "padrão" (sem override de manifests) — chamada explícita com
// array (usada em teste, e potencialmente por uma composição que queira simular um registro
// hipotético) nunca é cacheada, pra não vazar resultado de uma chamada pra outra.
const PLUGIN_ENGINE_REPORT_CACHE_KEY = "plugin-engine:report";
const PLUGIN_ENGINE_REPORT_CACHE_TTL_SECONDS = 30;

// Motor de plugins (docs/venore-docks.md — "Sistema de plugins"): lê os manifestos declarados em
// src/plugins/registry.ts, checa o estado de habilitação (contexts/extensions) ANTES de
// compatibilidade e dependência — plugin desabilitado nunca contribui navegação, permission,
// bloco ou setting, mas seu manifesto continua no relatório (status "disabled") pra tela de
// administração continuar mostrando e permitindo reabilitar. Depois valida, checa compatibilidade
// de versão, resolve dependências e monta o relatório de registro. Roda no bootstrap, sem ator
// humano — por isso actor "system" no log, mesmo espírito de contexts/rbac/features/role-
// assignment/assign-default-role.
export async function registerPlugins(manifests?: unknown[]): Promise<PluginRegistrationReport> {
  const usingDefaultRegistry = manifests === undefined;
  const inputManifests = manifests ?? PLUGIN_REGISTRY;

  if (usingDefaultRegistry) {
    const cached = getCache<PluginRegistrationReport>(PLUGIN_ENGINE_REPORT_CACHE_KEY);
    if (cached) {
      return cached;
    }
  }

  const handle = beginOperation({
    useCase: "platform.plugin-engine.register-plugins",
    actor: { id: "system", type: "system" },
    kind: "write",
  });

  const enabledStates = await listExtensionStates({ kind: "plugin" });
  const disabledKeys = new Set(
    enabledStates.success ? Object.entries(enabledStates.data).filter(([, enabled]) => !enabled).map(([key]) => key) : [],
  );

  const entries: PluginRegistrationEntry[] = [];
  const compatible: PluginManifest[] = [];

  for (const raw of inputManifests) {
    const validation = validateManifest(raw);
    if (!validation.valid) {
      entries.push({ key: validation.key, status: "invalid", errors: validation.errors });
      continue;
    }

    const { manifest } = validation;

    if (disabledKeys.has(manifest.key)) {
      entries.push({ key: manifest.key, status: "disabled", manifest, errors: [] });
      continue;
    }

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

  if (usingDefaultRegistry) {
    setCache(PLUGIN_ENGINE_REPORT_CACHE_KEY, report, PLUGIN_ENGINE_REPORT_CACHE_TTL_SECONDS);
  }

  return report;
}

export { PLUGIN_ENGINE_REPORT_CACHE_KEY };
