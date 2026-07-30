import Papa from "papaparse";
import { decodeCsvBytes, type CsvEncoding } from "./decode-csv-bytes";
import { csvHeaderLabel, REQUIRED_CSV_HEADERS, resolveCsvHeader, type CanonicalCsvHeader } from "./csv-headers";

export type RawCsvRow = {
  lineNumber: number;
  fullName: string;
  monthRaw: string;
  dayRaw: string;
  role: string;
  locality: string;
};

export type ParseBirthdaysCsvResult =
  | { success: true; rows: RawCsvRow[]; encoding: CsvEncoding }
  | { success: false; error: { code: string; message: string } };

// Parser real de CSV (papaparse), rodando no servidor. Delimitador é autodetectado entre vírgula
// e ponto-e-vírgula (padrão de export do Excel em pt-BR) via delimitersToGuess — papaparse já
// trata corretamente campo entre aspas contendo o delimitador (ex.: "Silva, Júnior"). Linhas em
// branco (inclusive no fim do arquivo) são ignoradas por skipEmptyLines, não tratadas como erro.
export function parseBirthdaysCsv(bytes: Buffer): ParseBirthdaysCsvResult {
  if (bytes.length === 0) {
    return { success: false, error: { code: "birthdays.csv_empty", message: "O arquivo está vazio." } };
  }

  const { text, encoding } = decodeCsvBytes(bytes);

  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    delimitersToGuess: [",", ";", "\t"],
    transformHeader: (header) => resolveCsvHeader(header),
  });

  const headerFields = new Set(parsed.meta.fields ?? []);
  const missingHeaders = REQUIRED_CSV_HEADERS.filter((header) => !headerFields.has(header));
  if (missingHeaders.length > 0) {
    return {
      success: false,
      error: {
        code: "birthdays.csv_missing_headers",
        message: `O cabeçalho do CSV não contém a(s) coluna(s) obrigatória(s): ${missingHeaders
          .map((header: CanonicalCsvHeader) => csvHeaderLabel(header))
          .join(", ")}.`,
      },
    };
  }

  if (parsed.data.length === 0) {
    return { success: false, error: { code: "birthdays.csv_empty", message: "O arquivo não tem linhas de dados." } };
  }

  const rows: RawCsvRow[] = parsed.data.map((record, index) => ({
    lineNumber: index + 2,
    fullName: (record.fullName ?? "").trim(),
    monthRaw: (record.month ?? "").trim(),
    dayRaw: (record.day ?? "").trim(),
    role: (record.role ?? "").trim(),
    locality: (record.locality ?? "").trim(),
  }));

  return { success: true, rows, encoding };
}
