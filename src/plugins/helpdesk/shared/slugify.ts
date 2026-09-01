// Mesmo formato de company-metrics/shared/slugify.ts e academy/shared/slug.ts — duplicado em vez
// de importado, plugins não dependem uns dos outros (§0 de docs/chamados-plugin.md).
const COMBINING_DIACRITICS = /[̀-ͯ]/g;

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
