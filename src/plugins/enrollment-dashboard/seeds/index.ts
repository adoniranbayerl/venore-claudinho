import type { PluginSeedFn } from "@/platform/plugin-engine/plugin-seed-registry";
import { seedEnrollmentDashboardExample } from "./example";

// Ponto de extensão "seeds" do plugin engine: a chave bate com a `key` declarada em
// manifest.seeds, e platform/plugin-engine/plugin-seed-registry.ts agrega este objeto por import
// estático.
export const enrollmentDashboardSeeds: Record<string, PluginSeedFn> = {
  example: seedEnrollmentDashboardExample,
};
