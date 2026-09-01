import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1" })),
  endOperation: vi.fn(),
}));

const queueExists = vi.fn();
const categoryKeyExists = vi.fn();
const nextCategoryPosition = vi.fn();
const insertCategory = vi.fn();
vi.mock("./store", () => ({
  queueExists: (...args: unknown[]) => queueExists(...args),
  categoryKeyExists: (...args: unknown[]) => categoryKeyExists(...args),
  nextCategoryPosition: (...args: unknown[]) => nextCategoryPosition(...args),
  insertCategory: (...args: unknown[]) => insertCategory(...args),
}));

describe("createCategory", () => {
  beforeEach(() => {
    queueExists.mockReset();
    categoryKeyExists.mockReset();
    nextCategoryPosition.mockReset();
    insertCategory.mockReset();
    queueExists.mockResolvedValue(true);
    nextCategoryPosition.mockResolvedValue(1);
    insertCategory.mockImplementation(async (input: Record<string, unknown>) => ({ id: "c1", ...input }));
  });

  it("fails when the queue does not exist", async () => {
    queueExists.mockResolvedValue(false);

    const { createCategory } = await import("./service");
    const result = await createCategory({ queueId: "missing", label: "Rede", actorId: "a1" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("helpdesk.create-category.queue_not_found");
    expect(insertCategory).not.toHaveBeenCalled();
  });

  it("derives a slug key scoped to the queue and trims the label", async () => {
    categoryKeyExists.mockResolvedValue(false);

    const { createCategory } = await import("./service");
    await createCategory({ queueId: "q1", label: "  Ar-condicionado  ", description: null, actorId: "a1" });

    expect(insertCategory).toHaveBeenCalledWith({
      queueId: "q1",
      key: "ar-condicionado",
      label: "Ar-condicionado",
      description: null,
      position: 1,
    });
  });

  it("suffixes the key on collision within the queue", async () => {
    categoryKeyExists.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    const { createCategory } = await import("./service");
    await createCategory({ queueId: "q1", label: "Rede", actorId: "a1" });

    expect(insertCategory).toHaveBeenCalledWith(expect.objectContaining({ key: "rede-2" }));
  });
});
