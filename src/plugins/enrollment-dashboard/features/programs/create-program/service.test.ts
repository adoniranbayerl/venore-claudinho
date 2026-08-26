import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/observability", () => ({
  beginOperation: vi.fn(() => ({ operationId: "op-1", useCase: "test", actor: { id: "actor-1", type: "user" }, kind: "write", startedAt: new Date() })),
  endOperation: vi.fn(),
}));

const institutionExists = vi.fn();
const programKeyExists = vi.fn();
const nextProgramPosition = vi.fn();
const insertProgram = vi.fn();

vi.mock("./store", () => ({
  institutionExists: (...args: unknown[]) => institutionExists(...args),
  programKeyExists: (...args: unknown[]) => programKeyExists(...args),
  nextProgramPosition: (...args: unknown[]) => nextProgramPosition(...args),
  insertProgram: (...args: unknown[]) => insertProgram(...args),
}));

describe("createProgram", () => {
  beforeEach(() => {
    institutionExists.mockReset().mockResolvedValue(true);
    programKeyExists.mockReset().mockResolvedValue(false);
    nextProgramPosition.mockReset().mockResolvedValue(1);
    insertProgram.mockReset().mockImplementation(async (input) => ({ id: "prog-1", ...input, createdAt: new Date(), updatedAt: new Date() }));
  });

  it("recusa quando a instituição não existe, sem chamar insertProgram", async () => {
    institutionExists.mockResolvedValue(false);

    const { createProgram } = await import("./service");
    const result = await createProgram({
      institutionId: "missing",
      label: "1º ano",
      goal: 30,
      renewed: 18,
      newEnrollments: 10,
      actorId: "actor-1",
    });

    expect(result).toEqual({ success: false, error: { code: "enrollment-dashboard.institution_not_found", message: "Instituição não encontrada." } });
    expect(insertProgram).not.toHaveBeenCalled();
  });

  it("gera a key a partir do label e grava groupLabel null quando ausente", async () => {
    const { createProgram } = await import("./service");
    await createProgram({ institutionId: "inst-1", label: "1º ano", goal: 30, renewed: 18, newEnrollments: 10, actorId: "actor-1" });

    expect(insertProgram).toHaveBeenCalledWith(
      expect.objectContaining({ institutionId: "inst-1", key: "1-ano", label: "1º ano", groupLabel: null, position: 1 }),
    );
  });
});
