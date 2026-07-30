import type { BlockDefinition } from "@/contexts/cms";

export const richtextBlockDefinition: BlockDefinition = {
  key: "core.content.richtext",
  label: "Rich Text",
  category: "conteúdo",
  structure: "leaf",
  allowedInRoot: false,
  defaultData: { markdown: "" },
  requiredDataFields: ["markdown"],
  missingConfigMessage: "Sem conteúdo definido",
  editorFields: [{ name: "markdown", type: "richtext", label: "Conteúdo (markdown)" }],
};
