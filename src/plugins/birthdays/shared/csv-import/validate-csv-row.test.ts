import { describe, expect, it } from "vitest";
import { validateCsvRow } from "./validate-csv-row";
import type { RawCsvRow } from "./parse-birthdays-csv";

function row(overrides: Partial<RawCsvRow> = {}): RawCsvRow {
  return {
    lineNumber: 14,
    fullName: "Maria Souza",
    monthRaw: "3",
    dayRaw: "15",
    role: "",
    locality: "",
    ...overrides,
  };
}

describe("validateCsvRow", () => {
  it("rejeita mês inválido, com o número da linha na mensagem", () => {
    const result = validateCsvRow(row({ monthRaw: "13" }));

    expect(result.error).toEqual({
      lineNumber: 14,
      code: "birthdays.invalid_month",
      message: "Linha 14: Mês inválido (13). Use um valor entre 1 e 12.",
    });
  });

  it("rejeita dia inválido para o mês (31 de abril)", () => {
    const result = validateCsvRow(row({ monthRaw: "4", dayRaw: "31" }));

    expect(result.error).toEqual({
      lineNumber: 14,
      code: "birthdays.impossible_day",
      message: "Linha 14: O dia 31 não existe para o mês 4 (máximo: 30).",
    });
  });

  it("rejeita mês não numérico", () => {
    const result = validateCsvRow(row({ monthRaw: "março" }));

    expect(result.error?.code).toBe("birthdays.csv_row_invalid_month");
  });

  it("rejeita nome completo vazio", () => {
    const result = validateCsvRow(row({ fullName: "" }));

    expect(result.error?.code).toBe("birthdays.csv_row_invalid_full_name");
  });

  it("aceita linha válida, aplicando Matriz como localidade padrão", () => {
    const result = validateCsvRow(row());

    expect(result.data).toEqual({
      lineNumber: 14,
      fullName: "Maria Souza",
      role: null,
      locality: "Matriz",
      month: 3,
      day: 15,
    });
  });
});
