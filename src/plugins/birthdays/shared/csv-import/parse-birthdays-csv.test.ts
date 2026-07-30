import { describe, expect, it } from "vitest";
import { parseBirthdaysCsv } from "./parse-birthdays-csv";

function csvBuffer(text: string, encoding: BufferEncoding = "utf-8"): Buffer {
  return Buffer.from(text, encoding);
}

describe("parseBirthdaysCsv", () => {
  it("detecta delimitador ponto-e-vírgula (planilha exportada do Excel em pt-BR)", () => {
    const csv = "Nome completo;Mês;Dia;Cargo;Localidade\nMaria Souza;3;15;Gerente;Matriz\n";

    const result = parseBirthdaysCsv(csvBuffer(csv));

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.rows).toEqual([
      { lineNumber: 2, fullName: "Maria Souza", monthRaw: "3", dayRaw: "15", role: "Gerente", locality: "Matriz" },
    ]);
  });

  it("mantém campo entre aspas com vírgula interna como um único valor (delimitador vírgula)", () => {
    const csv = 'Nome completo,Mês,Dia\n"Silva, Júnior",3,15\n';

    const result = parseBirthdaysCsv(csvBuffer(csv));

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.fullName).toBe("Silva, Júnior");
  });

  it("decodifica arquivo CSV em ISO-8859-1 sem corromper acentos", () => {
    const csv = "Nome completo,Mês,Dia\nJoão Antônio,3,15\n";

    const result = parseBirthdaysCsv(csvBuffer(csv, "latin1"));

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.encoding).toBe("iso-8859-1");
    expect(result.rows[0]?.fullName).toBe("João Antônio");
  });

  it("rejeita arquivo vazio", () => {
    const result = parseBirthdaysCsv(csvBuffer(""));

    expect(result).toEqual({
      success: false,
      error: { code: "birthdays.csv_empty", message: "O arquivo está vazio." },
    });
  });

  it("ignora linha em branco no fim do arquivo, sem tratar como erro", () => {
    const csv = "Nome completo,Mês,Dia\nMaria Souza,3,15\n\n\n";

    const result = parseBirthdaysCsv(csvBuffer(csv));

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.rows).toHaveLength(1);
  });

  it("aceita variação de caixa e acento no cabeçalho", () => {
    const csv = "NOME COMPLETO,MES,DIA\nMaria Souza,3,15\n";

    const result = parseBirthdaysCsv(csvBuffer(csv));

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.rows[0]?.fullName).toBe("Maria Souza");
  });

  it("rejeita arquivo sem as colunas obrigatórias no cabeçalho", () => {
    const csv = "Cargo,Localidade\nGerente,Matriz\n";

    const result = parseBirthdaysCsv(csvBuffer(csv));

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe("birthdays.csv_missing_headers");
  });
});
