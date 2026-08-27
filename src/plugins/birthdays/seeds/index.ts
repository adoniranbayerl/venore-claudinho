import type { PluginSeedFn } from "@/platform/plugin-engine/plugin-seed-registry";
import { seedBirthdaysExample } from "./example";

// Ponto de extensão "seeds" do plugin engine (mesmo padrão de blockDefinitions): a chave bate com
// a `key` declarada em manifest.seeds, e platform/plugin-engine/plugin-seed-registry.ts agrega
// este objeto por import estático.
export const birthdaysSeeds: Record<string, PluginSeedFn> = {
  example: seedBirthdaysExample,
};
