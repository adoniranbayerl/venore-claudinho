import type { BlockDefinition } from "@/contexts/cms";

export const birthdaysMonthListBlockDefinition: BlockDefinition = {
  key: "birthdays.month.list",
  label: "Aniversariantes — Lista do mês",
  category: "birthdays",
  structure: "leaf",
  allowedInRoot: true,
  defaultData: {
    title: "Aniversariantes do mês",
    description: "Confira quem celebra aniversário neste mês.",
    emptyMessage: "Não há aniversariantes cadastrados para este mês.",
    limit: 12,
  },
  editorFields: [
    { name: "title", type: "text", label: "Título" },
    { name: "description", type: "richtext", label: "Descrição" },
    { name: "emptyMessage", type: "richtext", label: "Mensagem quando não há aniversariantes" },
    { name: "limit", type: "number", label: "Quantidade máxima exibida" },
  ],
};
