// Buckets de período para lançamento de métricas. Puro (só Intl, sem I/O) — mesma disciplina de
// broadcast/shared/timezone.ts, copiado em vez de importado (§0). period_start é sempre uma data
// civil "YYYY-MM-DD" (a coluna metric_values.period_start é `date`, sem hora), então não há
// ambiguidade de fuso no armazenamento; o fuso só entra ao converter "agora" no bucket atual.

export type MetricGranularity = "daily" | "weekly" | "monthly";
export const METRIC_GRANULARITIES: MetricGranularity[] = ["daily", "weekly", "monthly"];

const CIVIL_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

type Civil = { y: number; m: number; d: number };

function toCivil(value: string): Civil {
  const match = CIVIL_RE.exec(value.trim());
  if (!match) throw new Error(`data civil inválida: ${value}`);
  return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function fromCivil({ y, m, d }: Civil): string {
  return `${y}-${pad(m)}-${pad(d)}`;
}

// Âncora a data civil no meio-dia UTC — longe de qualquer virada de fuso — só para fazer aritmética
// de calendário com o próprio Date, sem que o resultado "escorregue" um dia.
function civilToUtcNoon({ y, m, d }: Civil): Date {
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

function utcNoonToCivil(date: Date): Civil {
  return { y: date.getUTCFullYear(), m: date.getUTCMonth() + 1, d: date.getUTCDate() };
}

function addDays(value: string, days: number): string {
  const date = civilToUtcNoon(toCivil(value));
  date.setUTCDate(date.getUTCDate() + days);
  return fromCivil(utcNoonToCivil(date));
}

// 0 = domingo … 6 = sábado (igual Date.getDay()).
function weekday(value: string): number {
  return civilToUtcNoon(toCivil(value)).getUTCDay();
}

// Início do bucket que contém a data dada. Semana começa na segunda-feira (ISO).
export function bucketStart(dateStr: string, granularity: MetricGranularity): string {
  const civil = toCivil(dateStr);
  if (granularity === "daily") return fromCivil(civil);
  if (granularity === "monthly") return fromCivil({ ...civil, d: 1 });
  const daysSinceMonday = (weekday(dateStr) + 6) % 7;
  return addDays(fromCivil(civil), -daysSinceMonday);
}

// Início do bucket seguinte (o parâmetro já deve ser um início de bucket).
export function nextBucket(bucketStartStr: string, granularity: MetricGranularity): string {
  if (granularity === "daily") return addDays(bucketStartStr, 1);
  if (granularity === "weekly") return addDays(bucketStartStr, 7);
  const civil = toCivil(bucketStartStr);
  return fromCivil(civil.m === 12 ? { y: civil.y + 1, m: 1, d: 1 } : { y: civil.y, m: civil.m + 1, d: 1 });
}

// Lista de inícios de bucket cobrindo [fromStr, toStr], inclusive.
export function listBuckets(fromStr: string, toStr: string, granularity: MetricGranularity): string[] {
  const start = bucketStart(fromStr, granularity);
  const end = bucketStart(toStr, granularity);
  const buckets: string[] = [];
  let cursor = start;
  // Guarda contra range invertido ou muito grande (5 anos de dias).
  for (let guard = 0; guard < 2000 && cursor <= end; guard += 1) {
    buckets.push(cursor);
    cursor = nextBucket(cursor, granularity);
  }
  return buckets;
}

const CIVIL_PART_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();

function civilPartsFormatterFor(timeZone: string): Intl.DateTimeFormat {
  let formatter = CIVIL_PART_FORMATTER_CACHE.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
    CIVIL_PART_FORMATTER_CACHE.set(timeZone, formatter);
  }
  return formatter;
}

// Data civil de um instante, lida NO fuso dado — "YYYY-MM-DD".
export function zonedCivilDate(instant: Date, timeZone: string): string {
  // en-CA já formata como YYYY-MM-DD.
  return civilPartsFormatterFor(timeZone).format(instant);
}

// Bucket que contém "agora" no fuso da empresa.
export function currentBucket(granularity: MetricGranularity, timeZone: string, now: Date = new Date()): string {
  return bucketStart(zonedCivilDate(now, timeZone), granularity);
}

export function isValidCivilDate(value: string): boolean {
  if (!CIVIL_RE.test(value)) return false;
  const { y, m, d } = toCivil(value);
  const date = civilToUtcNoon({ y, m, d });
  return date.getUTCFullYear() === y && date.getUTCMonth() + 1 === m && date.getUTCDate() === d;
}
