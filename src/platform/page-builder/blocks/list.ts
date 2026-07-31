import type { BlockDefinition } from "@/contexts/cms";

export const listBlockDefinition: BlockDefinition = {
  key: "core.content.list",
  label: "Lista",
  category: "conteúdo",
  structure: "leaf",
  allowedInRoot: false,
  defaultData: { items: "", ordered: false },
  editorFields: [
    { name: "items", type: "textarea", label: "Itens (um por linha)" },
    { name: "ordered", type: "boolean", label: "Lista numerada" },
  ],
};
