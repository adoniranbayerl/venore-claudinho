import type { PluginSeedFn } from "@/platform/plugin-engine/plugin-seed-registry";
import { seedHelpdeskExample } from "./example";

// Ponto de extensão "seeds" do plugin engine: cada chave bate com uma `key` declarada em
// manifest.seeds, agregada por import estático em platform/plugin-engine/plugin-seed-registry.ts.
export const helpdeskSeeds: Record<string, PluginSeedFn> = {
  example: seedHelpdeskExample,
};
