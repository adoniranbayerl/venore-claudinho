import type { AreaDefinition, BlockDefinition } from "@/contexts/cms";

export const SECTION_BLOCK_KEY = "core.layout.section";

// Fábrica pelo mesmo motivo de createRowBlockDefinition (row.ts): allowedBlockKeys só é conhecido
// depois que o registry soma todos os blocos nesteáveis (core + plugin). Section funde os dois
// blocos "Section"/"Container" do TODO original — Container seria só um subconjunto dos campos de
// Section (largura máxima), não justifica um bloco à parte.
export function createSectionBlockDefinition(nestableBlockKeys: string[]): BlockDefinition {
  const areaDefinitions: AreaDefinition[] = [
    { key: "content", label: "Conteúdo", allowedBlockKeys: nestableBlockKeys },
  ];

  return {
    key: SECTION_BLOCK_KEY,
    label: "Seção",
    category: "estrutura",
    structure: "areas",
    allowedInRoot: true,
    defaultData: { background: "none", maxWidth: "full", paddingY: "md" },
    editorFields: [
      {
        name: "background",
        type: "select",
        label: "Fundo",
        options: [
          { value: "none", label: "Nenhum" },
          { value: "panel", label: "Painel" },
          { value: "muted", label: "Suave" },
        ],
      },
      {
        name: "maxWidth",
        type: "select",
        label: "Largura máxima",
        options: [
          { value: "full", label: "Total" },
          { value: "7xl", label: "Extra larga" },
          { value: "5xl", label: "Larga" },
          { value: "3xl", label: "Estreita" },
        ],
      },
      {
        name: "paddingY",
        type: "select",
        label: "Espaçamento vertical",
        options: [
          { value: "none", label: "Nenhum" },
          { value: "sm", label: "Pequeno" },
          { value: "md", label: "Médio" },
          { value: "lg", label: "Grande" },
        ],
      },
    ],
    areaDefinitions,
  };
}
