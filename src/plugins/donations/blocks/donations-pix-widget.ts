import type { BlockDefinition } from "@/contexts/cms";

export const donationsPixWidgetBlockDefinition: BlockDefinition = {
  key: "donations.pix-widget",
  label: "Doações — Widget PIX",
  category: "donations",
  structure: "leaf",
  allowedInRoot: true,
  defaultData: {
    title: "",
    description: "",
    variant: "full",
  },
  editorFields: [
    { name: "title", type: "text", label: "Título (deixe em branco pra usar o da configuração)" },
    { name: "description", type: "richtext", label: "Mensagem (deixe em branco pra usar a da configuração)" },
    {
      name: "variant",
      type: "select",
      label: "Tamanho",
      options: [
        { value: "full", label: "Completo" },
        { value: "compact", label: "Compacto (sidebar, banner)" },
      ],
    },
  ],
};
