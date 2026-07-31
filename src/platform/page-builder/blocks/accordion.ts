import type { BlockDefinition } from "@/contexts/cms";
import { ACCORDION_ITEM_BLOCK_KEY } from "./accordion-item";

export const accordionBlockDefinition: BlockDefinition = {
  key: "core.layout.accordion",
  label: "Acordeão",
  category: "estrutura",
  structure: "areas",
  allowedInRoot: true,
  defaultData: { allowMultiple: false },
  editorFields: [{ name: "allowMultiple", type: "boolean", label: "Permitir vários itens abertos" }],
  areaDefinitions: [{ key: "items", label: "Itens", allowedBlockKeys: [ACCORDION_ITEM_BLOCK_KEY] }],
};
