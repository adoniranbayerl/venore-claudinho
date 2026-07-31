import type { BlockDefinition } from "@/contexts/cms";

export const spacerBlockDefinition: BlockDefinition = {
  key: "core.layout.spacer",
  label: "Espaçador",
  category: "estrutura",
  structure: "leaf",
  allowedInRoot: false,
  defaultData: { size: "md" },
  editorFields: [
    {
      name: "size",
      type: "select",
      label: "Altura",
      options: [
        { value: "sm", label: "Pequena" },
        { value: "md", label: "Média" },
        { value: "lg", label: "Grande" },
        { value: "xl", label: "Extra grande" },
      ],
    },
  ],
};
