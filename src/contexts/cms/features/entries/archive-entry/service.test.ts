import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCache, setCache } from "../../../../../infrastructure/cache/memory-cache";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const findEntryById = vi.fn();
const markEntryArchived = vi.fn();

vi.mock("./store", () => ({
  findEntryById: (...args: unknown[]) => findEntryById(...args),
  markEntryArchived: (...args: unknown[]) => markEntryArchived(...args),
}));

describe("archiveEntry", () => {
  beforeEach(() => {
    findEntryById.mockReset();
    markEntryArchived.mockReset();
  });

  it("archives a published entry and invalidates the published-entries and navigation caches", async () => {
    findEntryById.mockResolvedValue({ id: "entry-1", status: "published" });
    markEntryArchived.mockResolvedValue({ id: "entry-1", status: "archived" });
    setCache("cms:entries:published:*:*", [{ id: "stale" }], 60);
    setCache("cms:navigation:by-location:main", [{ id: "stale-item" }], 60);

    const { archiveEntry } = await import("./service");
    const result = await archiveEntry({ id: "entry-1", actorId: "actor-1" });

    expect(result).toEqual({ success: true, data: { id: "entry-1", status: "archived" } });
    expect(getCache("cms:entries:published:*:*")).toBeNull();
    expect(getCache("cms:navigation:by-location:main")).toBeNull();
  });

  it("fails when the entry does not exist", async () => {
    findEntryById.mockResolvedValue(null);

    const { archiveEntry } = await import("./service");
    const result = await archiveEntry({ id: "missing", actorId: "actor-1" });

    expect(result).toEqual({ success: false, error: { code: "cms.entries.not_found", message: expect.any(String) } });
    expect(markEntryArchived).not.toHaveBeenCalled();
  });

  it("fails when the entry is already archived", async () => {
    findEntryById.mockResolvedValue({ id: "entry-1", status: "archived" });

    const { archiveEntry } = await import("./service");
    const result = await archiveEntry({ id: "entry-1", actorId: "actor-1" });

    expect(result).toEqual({ success: false, error: { code: "cms.entries.already_archived", message: expect.any(String) } });
    expect(markEntryArchived).not.toHaveBeenCalled();
  });
});
