import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1" })),
  endOperation: vi.fn(),
}));

const sectorKeyExists = vi.fn();
const nextSectorPosition = vi.fn();
const insertSector = vi.fn();
vi.mock("./store", () => ({
  sectorKeyExists: (...args: unknown[]) => sectorKeyExists(...args),
  nextSectorPosition: (...args: unknown[]) => nextSectorPosition(...args),
  insertSector: (...args: unknown[]) => insertSector(...args),
}));

describe("createSector", () => {
  beforeEach(() => {
    sectorKeyExists.mockReset();
    nextSectorPosition.mockReset();
    insertSector.mockReset();
    nextSectorPosition.mockResolvedValue(3);
    insertSector.mockImplementation(async (input: Record<string, unknown>) => ({ id: "s1", ...input }));
  });

  it("trims the name/description and derives a slug key", async () => {
    sectorKeyExists.mockResolvedValue(false);

    const { createSector } = await import("./service");
    const result = await createSector({ name: "  Recursos Humanos  ", description: "  pessoas  ", icon: "users", actorId: "a1" });

    expect(result.success).toBe(true);
    expect(insertSector).toHaveBeenCalledWith({
      key: "recursos-humanos",
      name: "Recursos Humanos",
      description: "pessoas",
      icon: "users",
      position: 3,
    });
  });

  it("suffixes the key on collision", async () => {
    sectorKeyExists.mockResolvedValueOnce(true).mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    const { createSector } = await import("./service");
    await createSector({ name: "Comercial", actorId: "a1" });

    expect(insertSector).toHaveBeenCalledWith(expect.objectContaining({ key: "comercial-3" }));
  });

  it("stores null description/icon when empty", async () => {
    sectorKeyExists.mockResolvedValue(false);

    const { createSector } = await import("./service");
    await createSector({ name: "Marketing", description: "   ", actorId: "a1" });

    expect(insertSector).toHaveBeenCalledWith(expect.objectContaining({ description: null, icon: null }));
  });
});
