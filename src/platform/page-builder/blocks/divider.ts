import type { BlockDefinition } from "@/contexts/cms";

export const dividerBlockDefinition: BlockDefinition = {
  key: "core.layout.divider",
  label: "Divisor",
  category: "estrutura",
  structure: "leaf",
  allowedInRoot: false,
  defaultData: { label: "" },
  editorFields: [{ name: "label", type: "text", label: "Rótulo (opcional)" }],
};
