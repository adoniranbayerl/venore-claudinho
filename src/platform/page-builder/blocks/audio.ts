import type { BlockDefinition } from "@/contexts/cms";

export const audioBlockDefinition: BlockDefinition = {
  key: "core.content.audio",
  label: "Áudio",
  category: "conteúdo",
  structure: "leaf",
  allowedInRoot: false,
  defaultData: { mediaId: null, title: "", showDownloadLink: false },
  requiredDataFields: ["mediaId"],
  missingConfigMessage: "Nenhum arquivo de áudio selecionado",
  editorFields: [
    { name: "mediaId", type: "audio", label: "Arquivo de áudio" },
    { name: "title", type: "text", label: "Título (opcional)" },
    { name: "showDownloadLink", type: "boolean", label: "Mostrar link de download" },
  ],
};
