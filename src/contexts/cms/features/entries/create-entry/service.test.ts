import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const getMedia = vi.fn();

vi.mock("@/contexts/media", () => ({
  getMedia: (...args: unknown[]) => getMedia(...args),
}));

const findEntryByCategoryAndSlug = vi.fn();
const insertEntry = vi.fn();

vi.mock("./store", () => ({
  findEntryByCategoryAndSlug: (...args: unknown[]) => findEntryByCategoryAndSlug(...args),
  insertEntry: (...args: unknown[]) => insertEntry(...args),
}));

describe("createEntry", () => {
  beforeEach(() => {
    findEntryByCategoryAndSlug.mockReset();
    insertEntry.mockReset();
    getMedia.mockReset();
  });

  it("creates an entry when the slug is not taken for the category", async () => {
    findEntryByCategoryAndSlug.mockResolvedValue(null);
    insertEntry.mockResolvedValue({
      id: "entry-1",
      contentTypeId: "ct-1",
      categoryId: null,
      title: "Hello",
      slug: "hello",
      status: "draft",
      data: {},
      mediaId: null,
      authorId: "actor-1",
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { createEntry } = await import("./service");
    const result = await createEntry({
      contentTypeId: "ct-1",
      title: "Hello",
      slug: "hello",
      actorId: "actor-1",
    });

    expect(result.success).toBe(true);
    expect(insertEntry).toHaveBeenCalledWith({
      contentTypeId: "ct-1",
      categoryId: undefined,
      title: "Hello",
      slug: "hello",
      data: undefined,
      mediaId: undefined,
      authorId: "actor-1",
    });
  });

  it("fails when the slug is already taken for the category", async () => {
    findEntryByCategoryAndSlug.mockResolvedValue({ id: "existing" });

    const { createEntry } = await import("./service");
    const result = await createEntry({
      contentTypeId: "ct-1",
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

  it("checks slug uniqueness scoped to categoryId, not contentTypeId", async () => {
    findEntryByCategoryAndSlug.mockResolvedValue(null);
    insertEntry.mockResolvedValue({
      id: "entry-1",
      contentTypeId: "ct-1",
      categoryId: "cat-1",
      title: "Hello",
      slug: "hello",
      status: "draft",
      data: {},
      mediaId: null,
      authorId: "actor-1",
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { createEntry } = await import("./service");
    await createEntry({
      contentTypeId: "ct-1",
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
      contentTypeId: "ct-1",
      categoryId: null,
      title: "Hello",
      slug: "hello",
      status: "draft",
      data: {},
      mediaId: null,
      authorId: "actor-1",
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { createEntry } = await import("./service");
    await createEntry({ contentTypeId: "ct-1", title: "Hello", slug: "hello", actorId: "actor-1" });

    expect(findEntryByCategoryAndSlug).toHaveBeenCalledWith(null, "hello");
  });

  it("fails when mediaId does not reference an existing media file", async () => {
    findEntryByCategoryAndSlug.mockResolvedValue(null);
    getMedia.mockResolvedValue({ success: true, data: null });

    const { createEntry } = await import("./service");
    const result = await createEntry({
      contentTypeId: "ct-1",
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
    getMedia.mockResolvedValue({ success: true, data: { id: "media-1" } });
    insertEntry.mockResolvedValue({
      id: "entry-2",
      contentTypeId: "ct-1",
      categoryId: null,
      title: "Hello",
      slug: "hello",
      status: "draft",
      data: {},
      mediaId: "media-1",
      authorId: "actor-1",
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { createEntry } = await import("./service");
    const result = await createEntry({
      contentTypeId: "ct-1",
      title: "Hello",
      slug: "hello",
      mediaId: "media-1",
      actorId: "actor-1",
    });

    expect(result.success).toBe(true);
    expect(getMedia).toHaveBeenCalledWith({ id: "media-1" });
  });
});
