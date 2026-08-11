// Recorrência simples "toda semana" — pedido explícito: "quero criar um evento que acontece toda
// semana, por exemplo toda Quarta. Não quero ter que ficar trocando a data toda semana. Quero que
// mostre a data da quarta próxima". Deliberadamente sem regra genérica de recorrência (RRULE
// completo, intervalo, "até tal data", exceções) — só o caso pedido, mesma hora e mesmo dia da
// semana, pra sempre.
//
// event.startAt é a ÂNCORA do padrão quando recurring=true — só o dia da semana e o horário dele
// importam, nunca a data em si. Puro (sem I/O), por isso vive em shared/, importável tanto pelo
// server (get-output-state/service.ts) quanto por um "use client" component (agenda-section.tsx,
// direto daqui, nunca do barrel — mesmo racional documentado em outros pontos do plugin).
export function resolveEventOccurrenceDate(event: { startAt: Date; recurring: boolean }, now: Date = new Date()): Date {
  if (!event.recurring) return event.startAt;
  return nextWeeklyOccurrence(event.startAt, now);
}

// Mesmo dia da semana e horário do anchor, na primeira ocorrência >= now — se hoje já É o dia da
// semana certo mas o horário de hoje já passou, pula pra semana que vem (não mostra "hoje" com um
// horário que já ficou pra trás).
function nextWeeklyOccurrence(anchor: Date, now: Date): Date {
  const candidate = new Date(now);
  candidate.setHours(anchor.getHours(), anchor.getMinutes(), anchor.getSeconds(), anchor.getMilliseconds());

  let dayDiff = anchor.getDay() - now.getDay();
  if (dayDiff < 0) dayDiff += 7;
  candidate.setDate(candidate.getDate() + dayDiff);

  if (candidate.getTime() < now.getTime()) {
    candidate.setDate(candidate.getDate() + 7);
  }

  return candidate;
}
