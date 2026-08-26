import { describe, expect, it } from "vitest";
import { validateCreateProgramInput } from "./validation";

const baseInput = { institutionId: "inst-1", label: "1º ano", goal: 30, renewed: 18, newEnrollments: 10 };

describe("validateCreateProgramInput — validação de fronteira", () => {
  it("rejeita institutionId vazio", () => {
    const error = validateCreateProgramInput({ ...baseInput, institutionId: "  " });
    expect(error?.code).toBe("enrollment-dashboard.invalid_institution_id");
  });

  it("rejeita label vazio", () => {
    const error = validateCreateProgramInput({ ...baseInput, label: "" });
    expect(error?.code).toBe("enrollment-dashboard.invalid_label");
  });

  it("rejeita meta negativa", () => {
    const error = validateCreateProgramInput({ ...baseInput, goal: -1 });
    expect(error?.code).toBe("enrollment-dashboard.invalid_counts");
  });

  it("rejeita contagem não inteira", () => {
    const error = validateCreateProgramInput({ ...baseInput, renewed: 2.5 });
    expect(error?.code).toBe("enrollment-dashboard.invalid_counts");
  });

  it("aceita zero em todos os contadores", () => {
    expect(validateCreateProgramInput({ ...baseInput, goal: 0, renewed: 0, newEnrollments: 0 })).toBeNull();
  });

  it("aceita entrada válida", () => {
    expect(validateCreateProgramInput(baseInput)).toBeNull();
  });
});
