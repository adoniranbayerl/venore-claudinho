import type { BlockDefinition } from "@/contexts/cms";
import { ICON_NAMES } from "./icon";

export const alertBlockDefinition: BlockDefinition = {
  key: "core.content.alert",
  label: "Aviso",
  category: "conteúdo",
  structure: "leaf",
  allowedInRoot: false,
  defaultData: { title: "Aviso", description: "", variant: "default", icon: "", titleAlign: "start" },
  requiredDataFields: ["title"],
  missingConfigMessage: "Sem título definido",
  editorFields: [
    { name: "title", type: "text", label: "Título" },
    { name: "description", type: "richtext", label: "Descrição" },
    {
      name: "variant",
      type: "select",
      label: "Variante",
      // Só "default"/"destructive" são variantes nativas do Alert do shadcn — warning/success/info
      // são camadas de className por cima (AlertBlockRenderer em block-renderers.tsx), usando
      // tokens de tema (--warning-*, --success-*) ou vocabulário shadcn já existente (info).
      options: [
        { value: "default", label: "Padrão" },
        { value: "destructive", label: "Destrutiva" },
        { value: "warning", label: "Aviso" },
        { value: "success", label: "Sucesso" },
        { value: "info", label: "Informativa" },
      ],
    },
    {
      // Mesma allowlist do bloco Ícone (blocks/icon.ts) — reaproveitada, não duplicada.
      name: "icon",
      type: "select",
      label: "Ícone (opcional)",
      options: [{ value: "", label: "Nenhum" }, ...ICON_NAMES.map((name) => ({ value: name, label: name }))],
    },
    {
      // No desktop o ícone fica ao lado do título (linha); no mobile fica acima (coluna) — este
      // campo controla o alinhamento do par ícone+título nos dois casos (ver AlertBlockRenderer).
      name: "titleAlign",
      type: "select",
      label: "Alinhamento do título e ícone",
      options: [
        { value: "start", label: "Esquerda" },
        { value: "center", label: "Centro" },
        { value: "end", label: "Direita" },
      ],
    },
  ],
};
