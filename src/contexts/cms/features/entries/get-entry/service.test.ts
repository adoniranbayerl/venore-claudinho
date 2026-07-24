import { beforeEach, describe, expect, it, vi } from "vitest";

const findEntryById = vi.fn();

vi.mock("./store", () => ({
  findEntryById: (...args: unknown[]) => findEntryById(...args),
}));

describe("getEntry", () => {
  beforeEach(() => {
    findEntryById.mockReset();
  });

  it("returns the entry when found, regardless of status", async () => {
    findEntryById.mockResolvedValue({ id: "entry-1", status: "published" });

    const { getEntry } = await import("./service");
    const result = await getEntry({ id: "entry-1" });

    expect(result).toEqual({ success: true, data: { id: "entry-1", status: "published" } });
  });

  it("returns a draft entry too, so the admin edit screen can open it", async () => {
    findEntryById.mockResolvedValue({ id: "draft-entry", status: "draft" });

    const { getEntry } = await import("./service");
    const result = await getEntry({ id: "draft-entry" });

    expect(result).toEqual({ success: true, data: { id: "draft-entry", status: "draft" } });
  });

  it("returns null when the entry does not exist", async () => {
    findEntryById.mockResolvedValue(null);

    const { getEntry } = await import("./service");
    const result = await getEntry({ id: "missing" });

    expect(result).toEqual({ success: true, data: null });
  });
});
