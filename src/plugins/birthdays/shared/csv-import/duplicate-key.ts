// Mesmo nome (case-insensitive, sem espaços nas pontas) + mês + dia é considerado duplicata,
// tanto contra registros já existentes no banco quanto entre linhas do próprio arquivo.
export function birthdayDuplicateKey(fullName: string, month: number, day: number): string {
  return `${fullName.trim().toLowerCase()}|${month}|${day}`;
}
