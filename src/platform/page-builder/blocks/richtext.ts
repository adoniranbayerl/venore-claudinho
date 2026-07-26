import type { BlockDefinition } from "@/contexts/cms";

export const richtextBlockDefinition: BlockDefinition = {
  key: "core.content.richtext",
  label: "Texto rico",
  category: "conteúdo",
  structure: "leaf",
  allowedInRoot: false,
  defaultData: { markdown: "" },
  editorFields: [{ name: "markdown", type: "richtext", label: "Conteúdo (markdown)" }],
};
