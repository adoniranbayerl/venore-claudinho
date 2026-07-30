import { describe, expect, it } from "vitest";
import { MAX_IMPORT_FILE_SIZE_BYTES, validateCsvFileSize } from "./limits";

describe("validateCsvFileSize", () => {
  it("rejeita arquivo acima do limite de tamanho, citando o limite na mensagem", () => {
    const oversized = Buffer.alloc(MAX_IMPORT_FILE_SIZE_BYTES + 1);

    const error = validateCsvFileSize(oversized);

    expect(error?.code).toBe("birthdays.csv_file_too_large");
    expect(error?.message).toContain(`${MAX_IMPORT_FILE_SIZE_BYTES / (1024 * 1024)}MB`);
  });

  it("rejeita arquivo vazio", () => {
    const error = validateCsvFileSize(Buffer.alloc(0));

    expect(error?.code).toBe("birthdays.csv_empty");
  });

  it("aceita arquivo dentro do limite", () => {
    const error = validateCsvFileSize(Buffer.alloc(1024));

    expect(error).toBeNull();
  });
});
