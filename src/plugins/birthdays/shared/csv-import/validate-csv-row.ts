import { validateBirthdayDate } from "../validate-birthday-date";
import type { RawCsvRow } from "./parse-birthdays-csv";

export type NormalizedCsvRow = {
  lineNumber: number;
  fullName: string;
  role: string | null;
  locality: string;
  month: number;
  day: number;
};

export type CsvRowValidationError = { lineNumber: number; code: string; message: string };

export type ValidateCsvRowResult = { data: NormalizedCsvRow; error?: undefined } | { data?: undefined; error: CsvRowValidationError };

function toInteger(raw: string): number | null {
  if (!/^-?\d+$/.test(raw)) {
    return null;
  }
  return Number.parseInt(raw, 10);
}

// Reusa a mesma validateBirthdayDate usada por create-birthday/update-birthday: uma única fonte
// pras regras de mês/dia, dentro ou fora do fluxo de importação.
export function validateCsvRow(row: RawCsvRow): ValidateCsvRowResult {
  const { lineNumber } = row;

  if (row.fullName.length === 0) {
    return {
      error: {
        lineNumber,
        code: "birthdays.csv_row_invalid_full_name",
        message: `Linha ${lineNumber}: nome completo não pode ser vazio.`,
      },
    };
  }

  if (row.monthRaw.length === 0) {
    return {
      error: {
        lineNumber,
        code: "birthdays.csv_row_invalid_month",
        message: `Linha ${lineNumber}: mês não pode ser vazio.`,
      },
    };
  }

  if (row.dayRaw.length === 0) {
    return {
      error: {
        lineNumber,
        code: "birthdays.csv_row_invalid_day",
        message: `Linha ${lineNumber}: dia não pode ser vazio.`,
      },
    };
  }

  const month = toInteger(row.monthRaw);
  if (month === null) {
    return {
      error: {
        lineNumber,
        code: "birthdays.csv_row_invalid_month",
        message: `Linha ${lineNumber}: mês "${row.monthRaw}" não é um número válido.`,
      },
    };
  }

  const day = toInteger(row.dayRaw);
  if (day === null) {
    return {
      error: {
        lineNumber,
        code: "birthdays.csv_row_invalid_day",
        message: `Linha ${lineNumber}: dia "${row.dayRaw}" não é um número válido.`,
      },
    };
  }

  const dateError = validateBirthdayDate(month, day);
  if (dateError) {
    return { error: { lineNumber, code: dateError.code, message: `Linha ${lineNumber}: ${dateError.message}` } };
  }

  return {
    data: {
      lineNumber,
      fullName: row.fullName,
      role: row.role.length > 0 ? row.role : null,
      locality: row.locality.length > 0 ? row.locality : "Matriz",
      month,
      day,
    },
  };
}
