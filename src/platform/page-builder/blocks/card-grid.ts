import type { BlockDefinition } from "@/contexts/cms";
import { CARD_BLOCK_KEY } from "./card";

export const cardGridBlockDefinition: BlockDefinition = {
  key: "core.layout.card-grid",
  label: "Grade de cards",
  category: "estrutura",
  structure: "areas",
  allowedInRoot: true,
  defaultData: { columns: 3 },
  editorFields: [
    {
      name: "columns",
      type: "select",
      label: "Colunas",
      options: [
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4", label: "4" },
      ],
    },
  ],
  areaDefinitions: [{ key: "items", label: "Cards", allowedBlockKeys: [CARD_BLOCK_KEY] }],
};
