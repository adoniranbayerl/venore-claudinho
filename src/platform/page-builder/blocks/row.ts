import type { AreaDefinition, BlockDefinition } from "@/contexts/cms";
import { ROW_AREA_KEYS, ROW_BLOCK_KEY } from "../row-columns";

// allowedBlockKeys só é conhecido depois que o registry soma blocos core + blocos de plugin
// (platform/page-builder/block-registry.ts) — por isso row é uma fábrica, não um objeto
// estático como os demais blocos core. "Dentro de area do row, tudo menos row" (pedido da
// sessão): quem chama passa a lista de keys nesteáveis, sem incluir "core.layout.row" nela.
export function createRowBlockDefinition(nestableBlockKeys: string[]): BlockDefinition {
  const areaDefinitions: AreaDefinition[] = ROW_AREA_KEYS.map((key, index) => ({
    key,
    label: `Coluna ${index + 1}`,
    allowedBlockKeys: nestableBlockKeys,
  }));

  return {
    key: ROW_BLOCK_KEY,
    label: "Linha",
    category: "estrutura",
    structure: "areas",
    // Regra de posição: só row na raiz (pedido da sessão).
    allowedInRoot: true,
    defaultData: { columns: 2, widths: "equal", gap: "md", align: "stretch", surface: "none" },
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
        // Só tem efeito com 2 colunas — ver comentário em row-columns.ts.
        name: "widths",
        type: "select",
        label: "Proporção das colunas (só com 2 colunas)",
        options: [
          { value: "equal", label: "Iguais" },
          { value: "1-3", label: "1/4 + 3/4" },
          { value: "1-2", label: "1/3 + 2/3" },
          { value: "2-1", label: "2/3 + 1/3" },
          { value: "3-1", label: "3/4 + 1/4" },
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
