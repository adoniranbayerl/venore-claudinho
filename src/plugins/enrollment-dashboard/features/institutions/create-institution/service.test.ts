import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const institutionKeyExists = vi.fn();
const nextInstitutionPosition = vi.fn();
const insertInstitution = vi.fn();

vi.mock("./store", () => ({
  institutionKeyExists: (...args: unknown[]) => institutionKeyExists(...args),
  nextInstitutionPosition: (...args: unknown[]) => nextInstitutionPosition(...args),
  insertInstitution: (...args: unknown[]) => insertInstitution(...args),
}));

describe("createInstitution", () => {
  beforeEach(() => {
    institutionKeyExists.mockReset();
    nextInstitutionPosition.mockReset().mockResolvedValue(1);
    insertInstitution.mockReset().mockImplementation(async (input) => ({
      id: "inst-1",
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  });

  it("gera a key a partir do nome e trima os campos", async () => {
    institutionKeyExists.mockResolvedValue(false);

    const { createInstitution } = await import("./service");
    const result = await createInstitution({
      name: "  Colégio Erasto Gaertner  ",
      programLabel: "  Turma  ",
      logoMediaId: null,
      actorId: "actor-1",
    });

    expect(result.success).toBe(true);
    expect(insertInstitution).toHaveBeenCalledWith(
      expect.objectContaining({ key: "colegio-erasto-gaertner", name: "Colégio Erasto Gaertner", programLabel: "Turma", position: 1 }),
    );
  });

  it("desambigua a key quando já existe uma instituição com a mesma", async () => {
    institutionKeyExists.mockImplementation(async (key: string) => key === "fidelis");

    const { createInstitution } = await import("./service");
    await createInstitution({ name: "Fidelis", programLabel: "Curso", actorId: "actor-1" });

    expect(insertInstitution).toHaveBeenCalledWith(expect.objectContaining({ key: "fidelis-2" }));
  });
});
