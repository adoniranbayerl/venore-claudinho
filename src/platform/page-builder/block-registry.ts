import type { BlockDefinition, ResolveBlockDefinition } from "@/contexts/cms";
import { blockDefinitions as academyBlockDefinitions } from "@/plugins/academy";
import { blockDefinitions as birthdaysBlockDefinitions } from "@/plugins/birthdays";
import { PLUGIN_REGISTRY } from "@/plugins/registry";
import { buttonBlockDefinition } from "./blocks/button";
import { headingBlockDefinition } from "./blocks/heading";
import { imageBlockDefinition } from "./blocks/image";
import { createRowBlockDefinition } from "./blocks/row";
import { richtextBlockDefinition } from "./blocks/richtext";
import { spacerBlockDefinition } from "./blocks/spacer";
import { dividerBlockDefinition } from "./blocks/divider";
import { iconBlockDefinition } from "./blocks/icon";
import { badgeBlockDefinition } from "./blocks/badge";
import { quoteBlockDefinition } from "./blocks/quote";
import { alertBlockDefinition } from "./blocks/alert";
import { listBlockDefinition } from "./blocks/list";
import { progressBlockDefinition } from "./blocks/progress";
import { cardBlockDefinition } from "./blocks/card";
import { audioBlockDefinition } from "./blocks/audio";
import { createSectionBlockDefinition } from "./blocks/section";
import { accordionBlockDefinition } from "./blocks/accordion";
import { createAccordionItemBlockDefinition } from "./blocks/accordion-item";
import { tabsBlockDefinition } from "./blocks/tabs";
import { createTabsItemBlockDefinition } from "./blocks/tabs-item";
import { cardGridBlockDefinition } from "./blocks/card-grid";

const CORE_LEAF_BLOCKS: BlockDefinition[] = [
  headingBlockDefinition,
  richtextBlockDefinition,
  imageBlockDefinition,
  buttonBlockDefinition,
  spacerBlockDefinition,
  dividerBlockDefinition,
  iconBlockDefinition,
  badgeBlockDefinition,
  quoteBlockDefinition,
  alertBlockDefinition,
  listBlockDefinition,
  progressBlockDefinition,
  cardBlockDefinition,
  audioBlockDefinition,
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

// Ordem de montagem importa: cada fábrica só conhece as keys já resolvidas antes dela.
// 1) leaf (core + plugin) — sem dependência de nada.
const leafBlocks: BlockDefinition[] = [...CORE_LEAF_BLOCKS, ...collectPluginBlocks()];
const leafBlockKeys = leafBlocks.map((block) => block.key);

// 2) accordion-item/tabs-item — área de conteúdo aceita só leaf/plugin (sem blocos estruturais
// aninhados nesta primeira versão, ver comentário em accordion-item.ts).
const accordionItemBlockDefinition = createAccordionItemBlockDefinition(leafBlockKeys);
const tabsItemBlockDefinition = createTabsItemBlockDefinition(leafBlockKeys);

// 3) accordion/tabs/card-grid — allowedBlockKeys fixo (só aceitam seu próprio bloco-item), não
// precisam de fábrica.
const structuralItemBlocks: BlockDefinition[] = [
  accordionBlockDefinition,
  accordionItemBlockDefinition,
  tabsBlockDefinition,
  tabsItemBlockDefinition,
  cardGridBlockDefinition,
];

// 4) row — "tudo menos row" (mesma regra de sempre), agora incluindo os blocos estruturais do
// passo 3.
const rowNestableKeys = [...leafBlockKeys, ...structuralItemBlocks.map((block) => block.key)];
const rowBlockDefinition = createRowBlockDefinition(rowNestableKeys);

// 5) section — "agrupa várias rows" (motivo de existir): sua área de conteúdo aceita tudo que row
// aceita, mais o próprio row.
const sectionNestableKeys = [...rowNestableKeys, rowBlockDefinition.key];
const sectionBlockDefinition = createSectionBlockDefinition(sectionNestableKeys);

const ALL_BLOCK_DEFINITIONS: BlockDefinition[] = [
  rowBlockDefinition,
  sectionBlockDefinition,
  ...leafBlocks,
  ...structuralItemBlocks,
];

const BLOCK_DEFINITIONS_BY_KEY = new Map(ALL_BLOCK_DEFINITIONS.map((block) => [block.key, block]));

export const resolveBlockDefinition: ResolveBlockDefinition = (key) => BLOCK_DEFINITIONS_BY_KEY.get(key) ?? null;

export function listBlockDefinitions(): BlockDefinition[] {
  return ALL_BLOCK_DEFINITIONS;
}
