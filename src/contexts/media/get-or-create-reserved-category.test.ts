import { beforeEach, describe, expect, it, vi } from "vitest";

const selectLimit = vi.fn();
const selectWhere = vi.fn(() => ({ limit: selectLimit }));
const selectFrom = vi.fn(() => ({ where: selectWhere }));
const selectMock = vi.fn(() => ({ from: selectFrom }));

const insertOnConflict = vi.fn();
const insertReturning = vi.fn(() => insertOnConflict());
const insertValues = vi.fn(() => ({ onConflictDoNothing: () => ({ returning: insertReturning }) }));
const insertMock = vi.fn(() => ({ values: insertValues }));

vi.mock("@/infrastructure/database/client", () => ({
  db: { select: selectMock, insert: insertMock },
}));

describe("getOrCreateReservedCategory", () => {
  beforeEach(() => {
    selectMock.mockClear();
    selectFrom.mockClear();
    selectLimit.mockReset();
    insertMock.mockClear();
    insertValues.mockClear();
    insertOnConflict.mockReset();
  });

  it("returns the existing category without inserting when it already exists", async () => {
    selectLimit.mockResolvedValueOnce([{ id: "cat-1", key: "avatars", name: "Avatares" }]);

    const { getOrCreateReservedCategory } = await import("./get-or-create-reserved-category");
    const result = await getOrCreateReservedCategory("avatars", "Avatares");

    expect(result).toEqual({ id: "cat-1", key: "avatars", name: "Avatares" });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("creates the category on first use when it does not exist yet", async () => {
    selectLimit.mockResolvedValueOnce([]);
    insertOnConflict.mockResolvedValueOnce([{ id: "cat-new", key: "avatars", name: "Avatares" }]);

    const { getOrCreateReservedCategory } = await import("./get-or-create-reserved-category");
    const result = await getOrCreateReservedCategory("avatars", "Avatares");

    expect(result).toEqual({ id: "cat-new", key: "avatars", name: "Avatares" });
  });

  it("re-fetches by key when a concurrent call wins the unique-index race", async () => {
    selectLimit.mockResolvedValueOnce([]).mockResolvedValueOnce([{ id: "cat-raced", key: "avatars", name: "Avatares" }]);
    insertOnConflict.mockResolvedValueOnce([]);

    const { getOrCreateReservedCategory } = await import("./get-or-create-reserved-category");
    const result = await getOrCreateReservedCategory("avatars", "Avatares");

    expect(result).toEqual({ id: "cat-raced", key: "avatars", name: "Avatares" });
    expect(selectLimit).toHaveBeenCalledTimes(2);
  });
});
