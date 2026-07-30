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

const commitBirthdaysCsvImport = vi.fn();

vi.mock("./store", () => ({
  commitBirthdaysCsvImport: (...args: unknown[]) => commitBirthdaysCsvImport(...args),
}));

function csvBuffer(text: string): Buffer {
  return Buffer.from(text, "utf-8");
}

describe("importBirthdaysCsv", () => {
  beforeEach(() => {
    commitBirthdaysCsvImport.mockReset();
  });

  it("grava só as linhas válidas e relata as ignoradas por erro, sem invalidar o restante", async () => {
    commitBirthdaysCsvImport.mockResolvedValue({
      totalRows: 2,
      insertedCount: 1,
      skippedDuplicateCount: 0,
      skippedErrorCount: 1,
      skipped: [{ lineNumber: 3, reason: 'Linha 3: Mês inválido (13). Use um valor entre 1 e 12.' }],
    });
    const csv = "Nome completo,Mês,Dia\nMaria Souza,3,15\nJoão,13,1\n";

    const { importBirthdaysCsv } = await import("./service");
    const result = await importBirthdaysCsv({ fileBuffer: csvBuffer(csv), includeDuplicates: false, actorId: "actor-1" });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.insertedCount).toBe(1);
    expect(result.data.skippedErrorCount).toBe(1);
    expect(commitBirthdaysCsvImport).toHaveBeenCalledWith(
      expect.objectContaining({
        rows: [expect.objectContaining({ fullName: "Maria Souza" })],
        includeDuplicates: false,
        actorId: "actor-1",
        totalRows: 2,
      }),
    );
  });

  it("não grava nada e devolve erro por linha quando o arquivo está vazio", async () => {
    const { importBirthdaysCsv } = await import("./service");
    const result = await importBirthdaysCsv({ fileBuffer: csvBuffer(""), includeDuplicates: false, actorId: "actor-1" });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.code).toBe("birthdays.csv_empty");
    expect(commitBirthdaysCsvImport).not.toHaveBeenCalled();
  });
});
