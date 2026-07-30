import { DAYS_PER_MONTH } from "./months";

export type BirthdayValidationError = { code: string; message: string };

// Única fonte de validação de mês/dia, reusada por create-birthday e update-birthday. O CHECK do
// banco (schema/index.ts) só garante a faixa 1..12 / 1..31 — a combinação "31 de fevereiro" só é
// rejeitada aqui.
export function validateBirthdayDate(month: number, day: number): BirthdayValidationError | null {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return {
      code: "birthdays.invalid_month",
      message: `Mês inválido (${month}). Use um valor entre 1 e 12.`,
    };
  }

  if (!Number.isInteger(day) || day < 1 || day > 31) {
    return {
      code: "birthdays.invalid_day",
      message: `Dia inválido (${day}). Use um valor entre 1 e 31.`,
    };
  }

  const maxDay = DAYS_PER_MONTH[month];
  if (day > maxDay) {
    return {
      code: "birthdays.impossible_day",
      message: `O dia ${day} não existe para o mês ${month} (máximo: ${maxDay}).`,
    };
  }

  return null;
}
