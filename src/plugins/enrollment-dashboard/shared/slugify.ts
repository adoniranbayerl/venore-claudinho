// Mesmo formato de src/plugins/academy/shared/slug.ts, duplicado em vez de importado — plugins
// não dependem uns dos outros (só de contexts via barrel), mesmo com academy instalado.
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
