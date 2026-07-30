import type { BlockDefinition, ResolveBlockDefinition } from "@/contexts/cms";
import { blockDefinitions as academyBlockDefinitions } from "@/plugins/academy";
import { blockDefinitions as birthdaysBlockDefinitions } from "@/plugins/birthdays";
import { PLUGIN_REGISTRY } from "@/plugins/registry";
import { buttonBlockDefinition } from "./blocks/button";
import { headingBlockDefinition } from "./blocks/heading";
import { imageBlockDefinition } from "./blocks/image";
import { createRowBlockDefinition } from "./blocks/row";
import { richtextBlockDefinition } from "./blocks/richtext";

const CORE_LEAF_BLOCKS: BlockDefinition[] = [
  headingBlockDefinition,
  richtextBlockDefinition,
  imageBlockDefinition,
  buttonBlockDefinition,
];

// contexts/cms não conhece plugin nenhum (regra de boundary da sessão) — este registry mora em
// platform/ exatamente pra poder importar tanto contexts/cms/contracts quanto o barrel público
// de cada plugin. Next.js exige import estático pra bundling (mesmo motivo de
// src/plugins/registry.ts), então um plugin que queira contribuir blocos expõe
// `blockDefinitions: BlockDefinition[]` no próprio barrel (index.ts) e ganha uma entrada aqui —
// nunca lido por scan de filesystem em runtime.
const PLUGIN_BLOCK_BARRELS: Record<string, { blockDefinitions?: BlockDefinition[] }> = {
  academy: { blockDefinitions: academyBlockDefinitions },
  birthdays: { blockDefinitions: birthdaysBlockDefinitions },
};

function collectPluginBlocks(): BlockDefinition[] {
  return PLUGIN_REGISTRY.flatMap((manifest) => PLUGIN_BLOCK_BARRELS[manifest.key]?.blockDefinitions ?? []);
}

const nestableBlocks: BlockDefinition[] = [...CORE_LEAF_BLOCKS, ...collectPluginBlocks()];
const rowBlockDefinition = createRowBlockDefinition(nestableBlocks.map((block) => block.key));

const ALL_BLOCK_DEFINITIONS: BlockDefinition[] = [rowBlockDefinition, ...nestableBlocks];

const BLOCK_DEFINITIONS_BY_KEY = new Map(ALL_BLOCK_DEFINITIONS.map((block) => [block.key, block]));

export const resolveBlockDefinition: ResolveBlockDefinition = (key) => BLOCK_DEFINITIONS_BY_KEY.get(key) ?? null;

export function listBlockDefinitions(): BlockDefinition[] {
  return ALL_BLOCK_DEFINITIONS;
}
