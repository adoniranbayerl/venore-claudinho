// Mesma regra de unicidade pública de entries (entries_category_slug_idx /
// entries_null_category_slug_idx, database/schema/index.ts) — usada tanto no export (pra gerar o
// ref) quanto no import (pra casar contentRef de menu item com a entry já criada/existente).
export function entryRef(categoryKey: string | null, slug: string): string {
  return categoryKey ? `${categoryKey}/${slug}` : slug;
}
