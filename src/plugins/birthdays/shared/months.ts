// Rótulo dos 12 meses como constante em código — sem tabela month_catalog, sem seed, sem FK
// (decisão G2 registrada em docs/plugins/birthdays-port.md e docs/issues.md): os 12 meses do ano
// nunca mudam, então não justificam uma tabela.
export const MONTH_LABELS: Record<number, string> = {
  1: "Janeiro",
  2: "Fevereiro",
  3: "Março",
  4: "Abril",
  5: "Maio",
  6: "Junho",
  7: "Julho",
  8: "Agosto",
  9: "Setembro",
  10: "Outubro",
  11: "Novembro",
  12: "Dezembro",
};

// Máximo de dias por mês, tolerante a fevereiro bissexto (29) — a ausência de ano na tabela
// birthdays é intencional, então o dia máximo aceito pra fevereiro é o do ano bissexto.
export const DAYS_PER_MONTH: Record<number, number> = {
  1: 31,
  2: 29,
  3: 31,
  4: 30,
  5: 31,
  6: 30,
  7: 31,
  8: 31,
  9: 30,
  10: 31,
  11: 30,
  12: 31,
};
