import type { PluginSeedFn } from "@/platform/plugin-engine/plugin-seed-registry";
import { seedCompanyMetricsExample } from "./example";
import { seedCompanyMetricsFluxo } from "./fluxo";

// Ponto de extensão "seeds" do plugin engine: cada chave bate com uma `key` declarada em
// manifest.seeds, agregada por import estático em platform/plugin-engine/plugin-seed-registry.ts.
export const companyMetricsSeeds: Record<string, PluginSeedFn> = {
  example: seedCompanyMetricsExample,
  "fluxo-completo": seedCompanyMetricsFluxo,
};
