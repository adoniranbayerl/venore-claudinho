import { beforeEach, describe, expect, it, vi } from "vitest";
import { BREADCRUMB_SEGMENT_NOT_OWNED } from "@/platform/breadcrumbs/types";
import type { BreadcrumbSegmentDefinition } from "@/platform/breadcrumbs/types";

const getCategoryBySlugHandler = vi.fn();
const getPublishedEntryBySlugHandler = vi.fn();

// Os outros segmentos do arquivo importam estes handlers — stub pra o import não puxar store/DB.
vi.mock("./features/entries/get-entry/handler", () => ({ getEntryHandler: vi.fn() }));
vi.mock("./features/menus/get-menu-tree/handler", () => ({ getMenuTreeHandler: vi.fn() }));
vi.mock("./features/categories/get-category-by-slug/handler", () => ({
  getCategoryBySlugHandler: (...args: unknown[]) => getCategoryBySlugHandler(...args),
}));
vi.mock("./features/entries/get-published-entry-by-slug/handler", () => ({
  getPublishedEntryBySlugHandler: (...args: unknown[]) => getPublishedEntryBySlugHandler(...args),
}));

const { cmsBreadcrumbSegments } = await import("./breadcrumbs");

function segment(key: string): BreadcrumbSegmentDefinition {
  const found = cmsBreadcrumbSegments.find((definition) => definition.key === key);
  if (!found) throw new Error(`segmento ${key} não registrado`);
  return found;
}

beforeEach(() => {
  getCategoryBySlugHandler.mockReset();
  getPublishedEntryBySlugHandler.mockReset();
});

describe("cms.public.entry-in-category — guard de wildcard posicional", () => {
  const resolve = (categorySlug: string, entrySlug: string) =>
    segment("cms.public.entry-in-category").resolve({ categorySlug, entrySlug });

  it("categoria inexistente => NOT_OWNED (caminho de outro dono: plugin, 404), não null", async () => {
    getCategoryBySlugHandler.mockResolvedValue({ success: true, data: null });

    await expect(resolve("cursos", "algum-curso")).resolves.toBe(BREADCRUMB_SEGMENT_NOT_OWNED);
    expect(getPublishedEntryBySlugHandler).not.toHaveBeenCalled();
  });

  it("categoria existe mas a entry publicada não => null (trilha do CMS que não fechou, avisa em dev)", async () => {
    getCategoryBySlugHandler.mockResolvedValue({ success: true, data: { id: "cat-1", slug: "blog" } });
    getPublishedEntryBySlugHandler.mockResolvedValue({ success: true, data: null });

    await expect(resolve("blog", "post-removido")).resolves.toBeNull();
  });

  it("categoria e entry resolvidas => rótulo + href", async () => {
    getCategoryBySlugHandler.mockResolvedValue({ success: true, data: { id: "cat-1", slug: "blog" } });
    getPublishedEntryBySlugHandler.mockResolvedValue({ success: true, data: { title: "Primeiro post" } });

    await expect(resolve("blog", "primeiro-post")).resolves.toEqual({
      label: "Primeiro post",
      href: "/blog/primeiro-post",
    });
  });
});

describe("cms.public.category-or-entry — guard de wildcard posicional", () => {
  const resolve = (slug: string) => segment("cms.public.category-or-entry").resolve({ slug });

  it("nem categoria nem entry raiz => NOT_OWNED", async () => {
    getCategoryBySlugHandler.mockResolvedValue({ success: true, data: null });
    getPublishedEntryBySlugHandler.mockResolvedValue({ success: true, data: null });

    await expect(resolve("academy")).resolves.toBe(BREADCRUMB_SEGMENT_NOT_OWNED);
  });

  it("categoria => nome da categoria", async () => {
    getCategoryBySlugHandler.mockResolvedValue({ success: true, data: { id: "cat-1", name: "Blog", slug: "blog" } });

    await expect(resolve("blog")).resolves.toEqual({ label: "Blog", href: "/blog" });
    expect(getPublishedEntryBySlugHandler).not.toHaveBeenCalled();
  });

  it("entry solta na raiz => título da entry", async () => {
    getCategoryBySlugHandler.mockResolvedValue({ success: true, data: null });
    getPublishedEntryBySlugHandler.mockResolvedValue({ success: true, data: { title: "Sobre nós" } });

    await expect(resolve("sobre")).resolves.toEqual({ label: "Sobre nós", href: "/sobre" });
  });
});
