// Fonte única do número de colunas do row (bug da sessão: RowBlock nunca lia block.data.columns
// — o grid vinha só do auto-fit do container, ignorando a escolha do autor). Compartilhado entre
// o render público (components/page-builder/block-renderer.tsx) e o editor
// (admin/cms/entries/[id]/builder/_components/block-tree.tsx) pra não duplicar o clamp.
export const ROW_BLOCK_KEY = "core.layout.row";

export const ROW_MIN_COLUMNS = 1;
export const ROW_MAX_COLUMNS = 4;

export const ROW_AREA_KEYS = ["col-1", "col-2", "col-3", "col-4"] as const;

// Mapa estático, não string montada: o scanner do Tailwind só enxerga classe literal.
export const ROW_COLUMN_GRID_CLASSES: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

export function resolveRowColumns(data: Record<string, unknown>): number {
  const raw = data.columns;
  const value = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(value)) {
    return 2;
  }
  return Math.min(ROW_MAX_COLUMNS, Math.max(ROW_MIN_COLUMNS, Math.round(value)));
}

// Redimensionar coluna só faz sentido com 2 colunas (proporção entre 2 lados é o caso de uso
// real — sidebar+conteúdo, texto+imagem). Com 3-4 colunas o valor é ignorado e cai pra igual
// (resolveRowWidthClasses trata isso). "equal" (default) usa ROW_COLUMN_GRID_CLASSES normal, sem
// override — as demais chaves substituem só o breakpoint sm: (mobile continua empilhado em 1
// coluna, mesma regra mobile-first das outras opções de row).
export const ROW_WIDTH_GRID_CLASSES: Record<string, string> = {
  "1-3": "grid-cols-1 sm:grid-cols-[1fr_3fr]",
  "1-2": "grid-cols-1 sm:grid-cols-[1fr_2fr]",
  "2-1": "grid-cols-1 sm:grid-cols-[2fr_1fr]",
  "3-1": "grid-cols-1 sm:grid-cols-[3fr_1fr]",
};

export function resolveRowGridClasses(data: Record<string, unknown>, columns: number): string {
  const widths = typeof data.widths === "string" ? data.widths : "equal";
  if (columns === 2 && ROW_WIDTH_GRID_CLASSES[widths]) {
    return ROW_WIDTH_GRID_CLASSES[widths];
  }
  return ROW_COLUMN_GRID_CLASSES[columns] ?? ROW_COLUMN_GRID_CLASSES[2];
}
