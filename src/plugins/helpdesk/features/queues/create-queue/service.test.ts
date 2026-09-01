import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1" })),
  endOperation: vi.fn(),
}));

const queueKeyExists = vi.fn();
const nextQueuePosition = vi.fn();
const insertQueue = vi.fn();
vi.mock("./store", () => ({
  queueKeyExists: (...args: unknown[]) => queueKeyExists(...args),
  nextQueuePosition: (...args: unknown[]) => nextQueuePosition(...args),
  insertQueue: (...args: unknown[]) => insertQueue(...args),
}));

describe("createQueue", () => {
  beforeEach(() => {
    queueKeyExists.mockReset();
    nextQueuePosition.mockReset();
    insertQueue.mockReset();
    nextQueuePosition.mockResolvedValue(2);
    insertQueue.mockImplementation(async (input: Record<string, unknown>) => ({ id: "q1", ...input }));
  });

  it("trims the name/description and derives a slug key", async () => {
    queueKeyExists.mockResolvedValue(false);

    const { createQueue } = await import("./service");
    const result = await createQueue({ name: "  Suporte Técnico  ", description: "  bla  ", icon: "wrench", actorId: "a1" });

    expect(result.success).toBe(true);
    expect(insertQueue).toHaveBeenCalledWith({
      key: "suporte-tecnico",
      name: "Suporte Técnico",
      description: "bla",
      icon: "wrench",
      position: 2,
    });
  });

  it("suffixes the key on collision", async () => {
    queueKeyExists.mockResolvedValueOnce(true).mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    const { createQueue } = await import("./service");
    await createQueue({ name: "TI", actorId: "a1" });

    expect(insertQueue).toHaveBeenCalledWith(expect.objectContaining({ key: "ti-3" }));
  });

  it("stores null description/icon when blank", async () => {
    queueKeyExists.mockResolvedValue(false);

    const { createQueue } = await import("./service");
    await createQueue({ name: "Manutenção", description: "   ", actorId: "a1" });

    expect(insertQueue).toHaveBeenCalledWith(expect.objectContaining({ description: null, icon: null }));
  });
});
