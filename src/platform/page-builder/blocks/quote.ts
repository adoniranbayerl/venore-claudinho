import type { BlockDefinition } from "@/contexts/cms";

export const quoteBlockDefinition: BlockDefinition = {
  key: "core.content.quote",
  label: "Citação",
  category: "conteúdo",
  structure: "leaf",
  allowedInRoot: false,
  defaultData: { text: "", author: "" },
  requiredDataFields: ["text"],
  missingConfigMessage: "Sem texto definido",
  editorFields: [
    { name: "text", type: "richtext", label: "Texto" },
    { name: "author", type: "text", label: "Autor (opcional)" },
  ],
};
