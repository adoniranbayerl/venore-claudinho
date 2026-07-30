// Quantos dias faltam até a próxima ocorrência de um aniversário sem ano (mês/dia). Lógica de
// apresentação (destacar "hoje"/"esta semana" na listagem admin), não regra de negócio — por
// isso vive junto da rota, não em features/*/service.ts.
//
// 29 de fevereiro em ano não bissexto vira 1º de março (comportamento nativo de `Date`) — a
// ausência de ano na tabela birthdays é intencional (ver docs/plugins/birthdays-port.md), então
// esse desvio de poucos dias a cada 4 anos é aceito em vez de reimplementar aritmética de
// calendário só para esse caso raro.
export function daysUntilNextOccurrence(month: number, day: number, from: Date): number {
  const startOfToday = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let candidate = new Date(from.getFullYear(), month - 1, day);
  if (candidate < startOfToday) {
    candidate = new Date(from.getFullYear() + 1, month - 1, day);
  }
  const diffMs = candidate.getTime() - startOfToday.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
