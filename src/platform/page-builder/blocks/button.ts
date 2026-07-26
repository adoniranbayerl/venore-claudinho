import type { BlockDefinition } from "@/contexts/cms";

export const buttonBlockDefinition: BlockDefinition = {
  key: "core.content.button",
  label: "Botão",
  category: "conteúdo",
  structure: "leaf",
  allowedInRoot: false,
  defaultData: { label: "Saiba mais", href: "", variant: "default" },
  editorFields: [
    { name: "label", type: "text", label: "Texto" },
    { name: "href", type: "url", label: "Link" },
    {
      name: "variant",
      type: "select",
      label: "Variante",
      options: [
        { value: "default", label: "Preenchido" },
        { value: "outline", label: "Contorno" },
        { value: "secondary", label: "Secundário" },
        { value: "ghost", label: "Discreto" },
      ],
    },
  ],
};
