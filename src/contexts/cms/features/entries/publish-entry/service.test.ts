import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCache, setCache } from "../../../../../infrastructure/cache/memory-cache";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findEntryById = vi.fn();
const markEntryPublished = vi.fn();

vi.mock("./store", () => ({
  findEntryById: (...args: unknown[]) => findEntryById(...args),
  markEntryPublished: (...args: unknown[]) => markEntryPublished(...args),
}));

describe("publishEntry", () => {
  beforeEach(() => {
    findEntryById.mockReset();
    markEntryPublished.mockReset();
  });

  it("publishes an existing entry and invalidates the published-entries cache", async () => {
    findEntryById.mockResolvedValue({ id: "entry-1", status: "draft" });
    markEntryPublished.mockResolvedValue({ id: "entry-1", status: "published" });
    setCache("cms:entries:published:*:*", [{ id: "stale" }], 60);

    const { publishEntry } = await import("./service");
    const result = await publishEntry({ id: "entry-1", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: { id: "entry-1", status: "published" } });
    expect(getCache("cms:entries:published:*:*")).toBeNull();
  });

  it("fails when the entry does not exist", async () => {
    findEntryById.mockResolvedValue(null);

    const { publishEntry } = await import("./service");
    const result = await publishEntry({ id: "missing", actorId: "actor-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "cms.entries.not_found", message: expect.any(String) },
    });
    expect(markEntryPublished).not.toHaveBeenCalled();
  });
});
