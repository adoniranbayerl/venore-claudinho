import type { BlockDefinition } from "@/contexts/cms";
import { TABS_ITEM_BLOCK_KEY } from "./tabs-item";

export const tabsBlockDefinition: BlockDefinition = {
  key: "core.layout.tabs",
  label: "Abas",
  category: "estrutura",
  structure: "areas",
  allowedInRoot: true,
  defaultData: {},
  editorFields: [],
  areaDefinitions: [{ key: "items", label: "Abas", allowedBlockKeys: [TABS_ITEM_BLOCK_KEY] }],
};
