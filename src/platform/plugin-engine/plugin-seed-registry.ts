import type { OperationResult } from "@/shared/types";
import { academySeeds } from "@/plugins/academy";
import { birthdaysSeeds } from "@/plugins/birthdays";
import { enrollmentDashboardSeeds } from "@/plugins/enrollment-dashboard";

// Uma função de seed é idempotente por contrato (list-then-skip pelo próprio seed) e devolve o
// OperationResult<void> padrão — nunca lança para erro esperado.
export type PluginSeedFn = () => Promise<OperationResult<void>>;

// Registro estático dos seeds contribuídos por plugin (docs/venore-docks.md — "Sistema de
// plugins"), mesmo padrão de platform/page-builder/block-registry.ts (PLUGIN_BLOCK_BARRELS):
// Next.js exige import estático pra bundling, então um plugin que queira contribuir seeds expõe
// `<plugin>Seeds: Record<seedKey, PluginSeedFn>` no próprio barrel (index.ts) e ganha uma entrada
// aqui — nunca lido por scan de filesystem em runtime. broadcast e donations não têm seed
// (broadcast depende de arquivos de mídia reais em disco; donations é settings-only).
const PLUGIN_SEED_REGISTRY: Record<string, Record<string, PluginSeedFn>> = {
  academy: academySeeds,
  birthdays: birthdaysSeeds,
  "enrollment-dashboard": enrollmentDashboardSeeds,
};

export function resolvePluginSeed(pluginKey: string, seedKey: string): PluginSeedFn | null {
  return PLUGIN_SEED_REGISTRY[pluginKey]?.[seedKey] ?? null;
}

export function listPluginSeedKeys(pluginKey: string): string[] {
  return Object.keys(PLUGIN_SEED_REGISTRY[pluginKey] ?? {});
}
