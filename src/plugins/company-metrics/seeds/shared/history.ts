import { bucketStart, currentBucket, subtractMonths } from "../../shared/period";
import { DEFAULT_COMPANY_METRICS_TIMEZONE } from "../../shared/settings";

// Gerador determinístico de série mensal para o seed — sem dependência de Math.random, então
// rodar o seed 2x produz os mesmos números (além do skip-if-exists por nome).

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295; // 0..1
}

export const HISTORY_MONTHS = 11;

// Lista dos inícios de bucket mensal cobrindo os últimos HISTORY_MONTHS meses até o mês atual.
export function monthlyBuckets(now: Date = new Date()): string[] {
  const current = currentBucket("monthly", DEFAULT_COMPANY_METRICS_TIMEZONE, now);
  const buckets: string[] = [];
  for (let i = HISTORY_MONTHS - 1; i >= 0; i -= 1) {
    buckets.push(bucketStart(subtractMonths(current, i), "monthly"));
  }
  return buckets;
}

// Série de valores: base cresce ~growth ao mês, com ruído de +-jitter proporcional. round=true
// arredonda pra inteiro (contagens), false mantém uma casa (percentual/moeda).
export function series(opts: {
  key: string;
  base: number;
  monthlyGrowth: number;
  jitter: number;
  round?: boolean;
  months?: number;
}): number[] {
  const count = opts.months ?? HISTORY_MONTHS;
  const out: number[] = [];
  for (let i = 0; i < count; i += 1) {
    const trend = opts.base * Math.pow(1 + opts.monthlyGrowth, i);
    const noise = (hash(`${opts.key}:${i}`) - 0.5) * 2 * opts.jitter * trend;
    const value = trend + noise;
    out.push(opts.round === false ? Math.round(value * 10) / 10 : Math.max(0, Math.round(value)));
  }
  return out;
}
