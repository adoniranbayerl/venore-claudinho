import { beforeEach, describe, expect, it, vi } from "vitest";

const findExistingBirthdayKeys = vi.fn();

vi.mock("./store", () => ({
  findExistingBirthdayKeys: (...args: unknown[]) => findExistingBirthdayKeys(...args),
}));

function csvBuffer(text: string): Buffer {
  return Buffer.from(text, "utf-8");
}

describe("previewBirthdaysCsvImport", () => {
  beforeEach(() => {
    findExistingBirthdayKeys.mockReset();
    findExistingBirthdayKeys.mockResolvedValue(new Set<string>());
  });

  it("marca linha como duplicata quando já existe um aniversariante com mesmo nome, mês e dia", async () => {
    findExistingBirthdayKeys.mockResolvedValue(new Set(["maria souza|3|15"]));
    const csv = "Nome completo,Mês,Dia\nMaria Souza,3,15\n";

    const { previewBirthdaysCsvImport } = await import("./service");
    const result = await previewBirthdaysCsvImport({ fileBuffer: csvBuffer(csv) });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.duplicateCount).toBe(1);
    expect(result.data.validCount).toBe(0);
    expect(result.data.rows[0]).toMatchObject({ status: "duplicate", fullName: "Maria Souza" });
  });

  it("marca a segunda ocorrência como duplicata quando o próprio arquivo repete nome+mês+dia", async () => {
    const csv = "Nome completo,Mês,Dia\nMaria Souza,3,15\nMaria Souza,3,15\n";

    const { previewBirthdaysCsvImport } = await import("./service");
    const result = await previewBirthdaysCsvImport({ fileBuffer: csvBuffer(csv) });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.validCount).toBe(1);
    expect(result.data.duplicateCount).toBe(1);
  });

  it("rejeita arquivo com mais linhas que o limite permitido", async () => {
    const header = "Nome completo,Mês,Dia\n";
    const rows = Array.from({ length: 2001 }, (_, i) => `Pessoa ${i},1,1`).join("\n");
    const csv = header + rows + "\n";

    const { previewBirthdaysCsvImport } = await import("./service");
    const result = await previewBirthdaysCsvImport({ fileBuffer: csvBuffer(csv) });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe("birthdays.csv_too_many_rows");
    expect(result.error.message).toContain("2000");
  });

  it("relata contagem de linhas com erro sem invalidar as linhas válidas", async () => {
    const csv = "Nome completo,Mês,Dia\nMaria Souza,3,15\nJoão,13,1\n";

    const { previewBirthdaysCsvImport } = await import("./service");
    const result = await previewBirthdaysCsvImport({ fileBuffer: csvBuffer(csv) });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.validCount).toBe(1);
    expect(result.data.errorCount).toBe(1);
    expect(result.data.rows[1]).toMatchObject({ status: "error", errorCode: "birthdays.invalid_month" });
  });
});
