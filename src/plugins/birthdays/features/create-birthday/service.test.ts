import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({
    operationId: "op-1",
    useCase: "test",
    actor: { id: "actor-1", type: "user" },
    kind: "write",
    startedAt: new Date(),
  })),
  endOperation: vi.fn(),
}));

const insertBirthday = vi.fn();

vi.mock("./store", () => ({
  insertBirthday: (...args: unknown[]) => insertBirthday(...args),
}));

describe("createBirthday", () => {
  beforeEach(() => {
    insertBirthday.mockReset();
  });

  it("trims fullName/role/locality and records the actor as createdByUserId", async () => {
    insertBirthday.mockResolvedValue({
      id: "birthday-1",
      fullName: "Maria Silva",
      role: "Analista",
      locality: "Matriz",
      month: 3,
      day: 15,
      createdByUserId: "actor-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { createBirthday } = await import("./service");
    const result = await createBirthday({
      fullName: "  Maria Silva  ",
      role: "  Analista  ",
      locality: "  Matriz  ",
      month: 3,
      day: 15,
      actorId: "actor-1",
    });

    expect(result.success).toBe(true);
    expect(insertBirthday).toHaveBeenCalledWith({
      fullName: "Maria Silva",
      role: "Analista",
      locality: "Matriz",
      month: 3,
      day: 15,
      createdByUserId: "actor-1",
    });
  });

  it("defaults locality to Matriz and role to null when not informed", async () => {
    insertBirthday.mockResolvedValue({
      id: "birthday-2",
      fullName: "João Souza",
      role: null,
      locality: "Matriz",
      month: 5,
      day: 20,
      createdByUserId: "actor-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { createBirthday } = await import("./service");
    await createBirthday({ fullName: "João Souza", month: 5, day: 20, actorId: "actor-1" });

    expect(insertBirthday).toHaveBeenCalledWith(
      expect.objectContaining({ locality: "Matriz", role: null }),
    );
  });
});
