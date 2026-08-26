import { describe, expect, it } from "vitest";
import { validateCreateInstitutionInput } from "./validation";

const baseInput = { name: "Colégio Erasto Gaertner", programLabel: "Turma" };

describe("validateCreateInstitutionInput — validação de fronteira", () => {
  it("rejeita nome vazio", () => {
    const error = validateCreateInstitutionInput({ ...baseInput, name: "   " });
    expect(error).toEqual({ code: "enrollment-dashboard.invalid_name", message: "O nome da instituição não pode ser vazio." });
  });

  it("rejeita programLabel vazio", () => {
    const error = validateCreateInstitutionInput({ ...baseInput, programLabel: "   " });
    expect(error?.code).toBe("enrollment-dashboard.invalid_program_label");
  });

  it("aceita entrada válida", () => {
    expect(validateCreateInstitutionInput(baseInput)).toBeNull();
  });
});
