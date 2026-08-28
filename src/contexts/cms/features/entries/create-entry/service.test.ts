import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCache, setCache } from "../../../../../infrastructure/cache/memory-cache";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const getMediaAsset = vi.fn();

vi.mock("@/contexts/media", () => ({
  getMediaAsset: (...args: unknown[]) => getMediaAsset(...args),
}));

const findEntryByCategoryAndSlug = vi.fn();
const insertEntry = vi.fn();

vi.mock("./store", () => ({
  findEntryByCategoryAndSlug: (...args: unknown[]) => findEntryByCategoryAndSlug(...args),
  insertEntry: (...args: unknown[]) => insertEntry(...args),
}));

const assertCmsCategoryScope = vi.fn();
vi.mock("../../../shared/scoped-authorization", () => ({
  assertCmsCategoryScope: (...args: unknown[]) => assertCmsCategoryScope(...args),
}));

describe("createEntry", () => {
  beforeEach(() => {
    findEntryByCategoryAndSlug.mockReset();
    insertEntry.mockReset();
    getMediaAsset.mockReset();
    assertCmsCategoryScope.mockReset();
    assertCmsCategoryScope.mockResolvedValue({ success: true, data: undefined });
  });

  it("rejects when the actor's category scope does not reach the target category (Fase C)", async () => {
    assertCmsCategoryScope.mockResolvedValue({
      success: false,
      error: { code: "cms.entries.forbidden_scope", message: "fora do escopo" },
    });

    const { createEntry } = await import("./service");
    const result = await createEntry({
      contentTypeIds: ["ct-1"],
      categoryId: "cat-z",
      title: "Hello",
      slug: "hello",
      actorId: "actor-1",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "cms.entries.forbidden_scope", message: expect.any(String) },
    });
    expect(assertCmsCategoryScope).toHaveBeenCalledWith("actor-1", ["cms.entries.manage"], "cat-z");
    expect(insertEntry).not.toHaveBeenCalled();
  });

  it("creates an entry when the slug is not taken for the category, and invalidates the tag entryCount cache", async () => {
    findEntryByCategoryAndSlug.mockResolvedValue(null);
    insertEntry.mockResolvedValue({
      id: "entry-1",
      contentTypeIds: ["ct-1"],
      categoryId: null,
      title: "Hello",
      slug: "hello",
      status: "draft",
      scheduledPublishAt: null,
      scheduledArchiveAt: null,
      visibility: "public",
      data: {},
      mediaId: null,
      authorId: "actor-1",
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setCache("cms:content-types", [{ id: "stale" }], 300);

    const { createEntry } = await import("./service");
    const result = await createEntry({
      contentTypeIds: ["ct-1"],
      title: "Hello",
      slug: "hello",
      actorId: "actor-1",
    });

    expect(getCache("cms:content-types")).toBeNull();

    expect(result.success).toBe(true);
    expect(insertEntry).toHaveBeenCalledWith({
      contentTypeIds: ["ct-1"],
      categoryId: undefined,
      title: "Hello",
      slug: "hello",
      visibility: undefined,
      data: undefined,
      mediaId: undefined,
      authorId: "actor-1",
    });
  });

  it("fails when the slug is already taken for the category", async () => {
    findEntryByCategoryAndSlug.mockResolvedValue({ id: "existing" });

    const { createEntry } = await import("./service");
    const result = await createEntry({
      contentTypeIds: ["ct-1"],
      title: "Hello",
      slug: "hello",
      actorId: "actor-1",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "cms.entries.slug_taken", message: expect.any(String) },
    });
    expect(insertEntry).not.toHaveBeenCalled();
  });

  it("checks slug uniqueness scoped to categoryId, not contentTypeIds", async () => {
    findEntryByCategoryAndSlug.mockResolvedValue(null);
    insertEntry.mockResolvedValue({
      id: "entry-1",
      contentTypeIds: ["ct-1"],
      categoryId: "cat-1",
      title: "Hello",
      slug: "hello",
      status: "draft",
      scheduledPublishAt: null,
      scheduledArchiveAt: null,
      visibility: "public",
      data: {},
      mediaId: null,
      authorId: "actor-1",
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { createEntry } = await import("./service");
    await createEntry({
      contentTypeIds: ["ct-1"],
      categoryId: "cat-1",
      title: "Hello",
      slug: "hello",
      actorId: "actor-1",
    });

    expect(findEntryByCategoryAndSlug).toHaveBeenCalledWith("cat-1", "hello");
  });

  it("checks slug uniqueness among entries without a category when categoryId is absent", async () => {
    findEntryByCategoryAndSlug.mockResolvedValue(null);
    insertEntry.mockResolvedValue({
      id: "entry-1",
      contentTypeIds: ["ct-1"],
      categoryId: null,
      title: "Hello",
      slug: "hello",
      status: "draft",
      scheduledPublishAt: null,
      scheduledArchiveAt: null,
      visibility: "public",
      data: {},
      mediaId: null,
      authorId: "actor-1",
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { createEntry } = await import("./service");
    await createEntry({ contentTypeIds: ["ct-1"], title: "Hello", slug: "hello", actorId: "actor-1" });

    expect(findEntryByCategoryAndSlug).toHaveBeenCalledWith(null, "hello");
  });

  it("fails when mediaId does not reference an existing media file", async () => {
    findEntryByCategoryAndSlug.mockResolvedValue(null);
    getMediaAsset.mockResolvedValue({ success: true, data: null });

    const { createEntry } = await import("./service");
    const result = await createEntry({
      contentTypeIds: ["ct-1"],
      title: "Hello",
      slug: "hello",
      mediaId: "media-missing",
      actorId: "actor-1",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "cms.entries.invalid_media", message: expect.any(String) },
    });
    expect(insertEntry).not.toHaveBeenCalled();
  });

  it("creates an entry when mediaId references an existing media file", async () => {
    findEntryByCategoryAndSlug.mockResolvedValue(null);
    getMediaAsset.mockResolvedValue({ success: true, data: { id: "media-1" } });
    insertEntry.mockResolvedValue({
      id: "entry-2",
      contentTypeIds: ["ct-1"],
      categoryId: null,
      title: "Hello",
      slug: "hello",
      status: "draft",
      scheduledPublishAt: null,
      scheduledArchiveAt: null,
      visibility: "public",
      data: {},
      mediaId: "media-1",
      authorId: "actor-1",
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { createEntry } = await import("./service");
    const result = await createEntry({
      contentTypeIds: ["ct-1"],
      title: "Hello",
      slug: "hello",
      mediaId: "media-1",
      actorId: "actor-1",
    });

    expect(result.success).toBe(true);
    expect(getMediaAsset).toHaveBeenCalledWith({ id: "media-1" });
  });
});
