import { beforeEach, describe, expect, it, vi } from "vitest";

const findCategoryById = vi.fn();
const countFilesByCategory = vi.fn();
const deleteCategoryById = vi.fn();

vi.mock("./store", () => ({
  findCategoryById: (...args: unknown[]) => findCategoryById(...args),
  countFilesByCategory: (...args: unknown[]) => countFilesByCategory(...args),
  deleteCategoryById: (...args: unknown[]) => deleteCategoryById(...args),
}));

describe("deleteCategory", () => {
  beforeEach(() => {
    findCategoryById.mockReset();
    countFilesByCategory.mockReset();
    deleteCategoryById.mockReset();
  });

  it("blocks deletion when the category is still used by files, without deleting or clearing anything", async () => {
    findCategoryById.mockResolvedValue({ id: "cat-1" });
    countFilesByCategory.mockResolvedValue(3);

    const { deleteCategory } = await import("./service");
    const result = await deleteCategory({ id: "cat-1" });

    expect(result).toEqual({
      success: false,
      error: { code: "media.categories.in_use", message: expect.stringContaining("3 arquivos") },
    });
    expect(deleteCategoryById).not.toHaveBeenCalled();
  });

  it("deletes the category once no file references it anymore", async () => {
    findCategoryById.mockResolvedValue({ id: "cat-1" });
    countFilesByCategory.mockResolvedValue(0);

    const { deleteCategory } = await import("./service");
    const result = await deleteCategory({ id: "cat-1" });

    expect(result).toEqual({ success: true, data: { id: "cat-1" } });
    expect(deleteCategoryById).toHaveBeenCalledWith("cat-1");
  });

  it("returns not_found when the category does not exist", async () => {
    findCategoryById.mockResolvedValue(null);

    const { deleteCategory } = await import("./service");
    const result = await deleteCategory({ id: "missing" });

    expect(result).toEqual({
      success: false,
      error: { code: "media.categories.not_found", message: expect.any(String) },
    });
    expect(countFilesByCategory).not.toHaveBeenCalled();
  });
});
