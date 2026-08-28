import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCache, setCache } from "../../../../../infrastructure/cache/memory-cache";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findEntryById = vi.fn();
const deleteEntryById = vi.fn();

vi.mock("./store", () => ({
  findEntryById: (...args: unknown[]) => findEntryById(...args),
  deleteEntryById: (...args: unknown[]) => deleteEntryById(...args),
}));

const assertCmsCategoryScope = vi.fn();
vi.mock("../../../shared/scoped-authorization", () => ({
  assertCmsCategoryScope: (...args: unknown[]) => assertCmsCategoryScope(...args),
}));

describe("deleteEntry", () => {
  beforeEach(() => {
    findEntryById.mockReset();
    deleteEntryById.mockReset();
    assertCmsCategoryScope.mockReset();
    assertCmsCategoryScope.mockResolvedValue({ success: true, data: undefined });
  });

  it("rejects when the actor's scope does not reach the archived entry's category (Fase C)", async () => {
    findEntryById.mockResolvedValue({ id: "entry-1", status: "archived", categoryId: "cat-a" });
    assertCmsCategoryScope.mockResolvedValue({
      success: false,
      error: { code: "cms.entries.forbidden_scope", message: "fora do escopo" },
    });

    const { deleteEntry } = await import("./service");
    const result = await deleteEntry({ id: "entry-1", actorId: "actor-1" });

    expect(result.success).toBe(false);
    expect(assertCmsCategoryScope).toHaveBeenCalledWith("actor-1", ["cms.entries.manage"], "cat-a");
    expect(deleteEntryById).not.toHaveBeenCalled();
  });

  it("deletes an archived entry and invalidates the tag entryCount cache", async () => {
    findEntryById.mockResolvedValue({ id: "entry-1", status: "archived" });
    deleteEntryById.mockResolvedValue(undefined);
    setCache("cms:content-types", [{ id: "stale" }], 300);

    const { deleteEntry } = await import("./service");
    const result = await deleteEntry({ id: "entry-1", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: undefined });
    expect(deleteEntryById).toHaveBeenCalledWith("entry-1");
    expect(getCache("cms:content-types")).toBeNull();
  });

  it("fails when the entry does not exist", async () => {
    findEntryById.mockResolvedValue(null);

    const { deleteEntry } = await import("./service");
    const result = await deleteEntry({ id: "missing", actorId: "actor-1" });

    expect(result).toEqual({ success: false, error: { code: "cms.entries.not_found", message: expect.any(String) } });
    expect(deleteEntryById).not.toHaveBeenCalled();
  });

  it.each(["draft", "scheduled", "published"] as const)("fails when the entry status is %s (not archived)", async (status) => {
    findEntryById.mockResolvedValue({ id: "entry-1", status });

    const { deleteEntry } = await import("./service");
    const result = await deleteEntry({ id: "entry-1", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "cms.entries.delete_requires_archived", message: expect.any(String) },
    });
    expect(deleteEntryById).not.toHaveBeenCalled();
  });
});
