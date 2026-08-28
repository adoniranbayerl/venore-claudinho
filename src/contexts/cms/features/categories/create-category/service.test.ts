import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const invalidateCacheByPrefix = vi.fn();
vi.mock("../../../../../infrastructure/cache/memory-cache", () => ({
  invalidateCacheByPrefix: (...args: unknown[]) => invalidateCacheByPrefix(...args),
}));

const findCategoryByKey = vi.fn();
const findCategoryBySlug = vi.fn();
const insertCategory = vi.fn();
vi.mock("./store", () => ({
  findCategoryByKey: (...args: unknown[]) => findCategoryByKey(...args),
  findCategoryBySlug: (...args: unknown[]) => findCategoryBySlug(...args),
  insertCategory: (...args: unknown[]) => insertCategory(...args),
}));

const assertCmsCategoryScope = vi.fn();
vi.mock("../../../shared/scoped-authorization", () => ({
  assertCmsCategoryScope: (...args: unknown[]) => assertCmsCategoryScope(...args),
}));

const input = { key: "novidades", slug: "novidades", name: "Novidades", actorId: "actor-1" };

describe("createCategory", () => {
  beforeEach(() => {
    findCategoryByKey.mockReset().mockResolvedValue(null);
    findCategoryBySlug.mockReset().mockResolvedValue(null);
    insertCategory.mockReset().mockResolvedValue({ id: "cat-1", ...input, description: null });
    invalidateCacheByPrefix.mockReset();
    assertCmsCategoryScope.mockReset();
    assertCmsCategoryScope.mockResolvedValue({ success: true, data: undefined });
  });

  it("creates a category when the actor has cms.categories.manage globally", async () => {
    const { createCategory } = await import("./service");
    const result = await createCategory(input);

    expect(result.success).toBe(true);
    // Fase C: criar categoria só é permitido globalmente — categoryId nulo no check.
    expect(assertCmsCategoryScope).toHaveBeenCalledWith("actor-1", ["cms.categories.manage"], null);
    expect(insertCategory).toHaveBeenCalled();
  });

  it("rejects a scoped editor — creating a category requires the global permission (Fase C)", async () => {
    assertCmsCategoryScope.mockResolvedValue({
      success: false,
      error: { code: "cms.categories.forbidden_scope", message: "exige acesso global" },
    });

    const { createCategory } = await import("./service");
    const result = await createCategory(input);

    expect(result).toEqual({
      success: false,
      error: { code: "cms.categories.forbidden_scope", message: expect.any(String) },
    });
    expect(insertCategory).not.toHaveBeenCalled();
  });
});
