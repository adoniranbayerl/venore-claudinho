import type { AreaDefinition, BlockDefinition } from "@/contexts/cms";

export const ACCORDION_ITEM_BLOCK_KEY = "core.layout.accordion-item";

// Área de conteúdo aceita bloco leaf/plugin (mesma lista que row recebe para suas colunas), não
// blocos estruturais (row/section/accordion/tabs/card-grid) — evita aninhamento estrutural
// profundo nesta primeira versão. Só existe dentro da área "items" de core.layout.accordion
// (restrição vive no areaDefinitions do accordion, não aqui — mesmo padrão de row/row-columns).
export function createAccordionItemBlockDefinition(contentBlockKeys: string[]): BlockDefinition {
  const areaDefinitions: AreaDefinition[] = [
    { key: "content", label: "Conteúdo", allowedBlockKeys: contentBlockKeys },
  ];

  return {
    key: ACCORDION_ITEM_BLOCK_KEY,
    label: "Item de acordeão",
    category: "estrutura",
    structure: "areas",
    allowedInRoot: false,
    defaultData: { title: "Item" },
    requiredDataFields: ["title"],
    missingConfigMessage: "Sem título definido",
    editorFields: [{ name: "title", type: "text", label: "Título" }],
    areaDefinitions,
  };
}
