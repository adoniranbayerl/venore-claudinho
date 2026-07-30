import { describe, expect, it } from "vitest";
import { validateCreateBirthdayInput } from "./validation";

const baseInput = { fullName: "Maria Silva", month: 3, day: 15 };

describe("validateCreateBirthdayInput — validação de fronteira", () => {
  it("rejeita mês 0", () => {
    const error = validateCreateBirthdayInput({ ...baseInput, month: 0 });
    expect(error).toEqual({
      code: "birthdays.invalid_month",
      message: "Mês inválido (0). Use um valor entre 1 e 12.",
    });
  });

  it("rejeita mês 13", () => {
    const error = validateCreateBirthdayInput({ ...baseInput, month: 13 });
    expect(error).toEqual({
      code: "birthdays.invalid_month",
      message: "Mês inválido (13). Use um valor entre 1 e 12.",
    });
  });

  it("rejeita dia inexistente para o mês (31 de abril)", () => {
    const error = validateCreateBirthdayInput({ ...baseInput, month: 4, day: 31 });
    expect(error).toEqual({
      code: "birthdays.impossible_day",
      message: "O dia 31 não existe para o mês 4 (máximo: 30).",
    });
  });

  it("aceita 29 de fevereiro (ano bissexto tolerado por não haver campo de ano)", () => {
    const error = validateCreateBirthdayInput({ ...baseInput, month: 2, day: 29 });
    expect(error).toBeNull();
  });

  it("rejeita nome completo vazio", () => {
    const error = validateCreateBirthdayInput({ ...baseInput, fullName: "   " });
    expect(error).toEqual({
      code: "birthdays.invalid_full_name",
      message: "O nome completo não pode ser vazio.",
    });
  });

  it("aceita entrada válida", () => {
    const error = validateCreateBirthdayInput(baseInput);
    expect(error).toBeNull();
  });
});
