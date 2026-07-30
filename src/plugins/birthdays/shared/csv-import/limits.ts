// Limites de importação em lote — verificados no servidor, nunca só na UI, e sempre citados na
// mensagem de erro (o usuário precisa saber qual é o limite pra ajustar o arquivo).
export const MAX_IMPORT_FILE_SIZE_BYTES = 2 * 1024 * 1024;
export const MAX_IMPORT_ROWS = 2000;

export const MAX_IMPORT_FILE_SIZE_MESSAGE =
  `O arquivo excede o limite de ${MAX_IMPORT_FILE_SIZE_BYTES / (1024 * 1024)}MB.`;

export function maxImportRowsMessage(rowCount: number): string {
  return `O arquivo tem ${rowCount} linhas de dados, acima do limite de ${MAX_IMPORT_ROWS}.`;
}

export type CsvImportValidationError = { code: string; message: string };

export function validateCsvFileSize(fileBuffer: Buffer): CsvImportValidationError | null {
  if (fileBuffer.length === 0) {
    return { code: "birthdays.csv_empty", message: "O arquivo está vazio." };
  }

  if (fileBuffer.length > MAX_IMPORT_FILE_SIZE_BYTES) {
    return { code: "birthdays.csv_file_too_large", message: MAX_IMPORT_FILE_SIZE_MESSAGE };
  }

  return null;
}
