import type { AreaDefinition, BlockDefinition } from "@/contexts/cms";

const AREA_KEYS = ["col-1", "col-2", "col-3", "col-4"] as const;

// allowedBlockKeys só é conhecido depois que o registry soma blocos core + blocos de plugin
// (platform/page-builder/block-registry.ts) — por isso row é uma fábrica, não um objeto
// estático como os demais blocos core. "Dentro de area do row, tudo menos row" (pedido da
// sessão): quem chama passa a lista de keys nesteáveis, sem incluir "core.layout.row" nela.
export function createRowBlockDefinition(nestableBlockKeys: string[]): BlockDefinition {
  const areaDefinitions: AreaDefinition[] = AREA_KEYS.map((key, index) => ({
    key,
    label: `Coluna ${index + 1}`,
    allowedBlockKeys: nestableBlockKeys,
  }));

  return {
    key: "core.layout.row",
    label: "Linha",
    category: "estrutura",
    structure: "areas",
    // Regra de posição: só row na raiz (pedido da sessão).
    allowedInRoot: true,
    defaultData: { columns: 2, gap: "md", align: "stretch", surface: "none" },
    editorFields: [
      {
        name: "columns",
        type: "select",
        label: "Colunas",
        options: [
          { value: "1", label: "1" },
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
        ],
      },
      {
        name: "gap",
        type: "select",
        label: "Espaçamento",
        options: [
          { value: "sm", label: "Pequeno" },
          { value: "md", label: "Médio" },
          { value: "lg", label: "Grande" },
        ],
      },
      {
        name: "align",
        type: "select",
        label: "Alinhamento vertical",
        options: [
          { value: "start", label: "Topo" },
          { value: "center", label: "Centro" },
          { value: "stretch", label: "Esticar" },
        ],
      },
      {
        name: "surface",
        type: "select",
        label: "Superfície",
        options: [
          { value: "none", label: "Nenhuma" },
          { value: "panel", label: "Painel" },
          { value: "elevated", label: "Elevada" },
        ],
      },
    ],
    areaDefinitions,
  };
}
