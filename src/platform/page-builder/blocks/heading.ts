import type { BlockDefinition } from "@/contexts/cms";

export const headingBlockDefinition: BlockDefinition = {
  key: "core.content.heading",
  label: "Título",
  category: "conteúdo",
  structure: "leaf",
  allowedInRoot: false,
  defaultData: { level: 2, text: "Título", align: "start" },
  requiredDataFields: ["text"],
  missingConfigMessage: "Sem texto definido",
  editorFields: [
    {
      name: "level",
      type: "select",
      label: "Nível",
      options: [
        { value: "1", label: "H1" },
        { value: "2", label: "H2" },
        { value: "3", label: "H3" },
        { value: "4", label: "H4" },
      ],
    },
    { name: "text", type: "text", label: "Texto" },
    {
      name: "align",
      type: "select",
      label: "Alinhamento",
      options: [
        { value: "start", label: "Esquerda" },
        { value: "center", label: "Centro" },
        { value: "end", label: "Direita" },
      ],
    },
  ],
};
