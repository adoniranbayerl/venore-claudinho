import type { BlockDefinition } from "@/contexts/cms";

// Allowlist curada de ícones lucide — nome dinâmico de ícone não é bundlable sem mapa fixo (mesmo
// motivo do GAP_CLASSES em block-renderers.tsx). ICON_COMPONENTS (block-renderers.tsx) precisa
// conter exatamente estas mesmas chaves.
export const ICON_NAMES = [
  "star",
  "heart",
  "check",
  "arrow-right",
  "info",
  "alert-triangle",
  "check-circle",
  "mail",
  "phone",
  "map-pin",
  "calendar",
  "clock",
  "user",
  "users",
  "settings",
  "search",
  "download",
  "award",
  "book-open",
  "zap",
] as const;

export const iconBlockDefinition: BlockDefinition = {
  key: "core.content.icon",
  label: "Ícone",
  category: "conteúdo",
  structure: "leaf",
  allowedInRoot: false,
  defaultData: { name: "star", size: "md", tone: "foreground" },
  editorFields: [
    {
      name: "name",
      type: "select",
      label: "Ícone",
      options: ICON_NAMES.map((name) => ({ value: name, label: name })),
    },
    {
      name: "size",
      type: "select",
      label: "Tamanho",
      options: [
        { value: "sm", label: "Pequeno" },
        { value: "md", label: "Médio" },
        { value: "lg", label: "Grande" },
      ],
    },
    {
      name: "tone",
      type: "select",
      label: "Tom",
      options: [
        { value: "foreground", label: "Padrão" },
        { value: "muted", label: "Suave" },
        { value: "primary", label: "Destaque" },
      ],
    },
  ],
};
