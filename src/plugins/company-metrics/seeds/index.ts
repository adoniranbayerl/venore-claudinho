import type { PluginSeedFn } from "@/platform/plugin-engine/plugin-seed-registry";
import { seedCompanyMetricsExample } from "./example";

// Ponto de extensão "seeds" do plugin engine: a chave bate com a `key` declarada em
// manifest.seeds, agregada por import estático em platform/plugin-engine/plugin-seed-registry.ts.
export const companyMetricsSeeds: Record<string, PluginSeedFn> = {
  example: seedCompanyMetricsExample,
};
