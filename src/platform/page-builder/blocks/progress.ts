import type { BlockDefinition } from "@/contexts/cms";

// Barra de progresso genérica com valor fixado pelo autor da página. A versão com dado real de
// curso (progresso do aluno) é academy.course.progress, em src/plugins/academy/blocks.
export const progressBlockDefinition: BlockDefinition = {
  key: "core.content.progress",
  label: "Progresso",
  category: "conteúdo",
  structure: "leaf",
  allowedInRoot: false,
  defaultData: { label: "Progresso", value: 50, showPercent: true },
  editorFields: [
    { name: "label", type: "text", label: "Rótulo" },
    { name: "value", type: "number", label: "Valor (0-100)" },
    { name: "showPercent", type: "boolean", label: "Mostrar porcentagem" },
  ],
};
