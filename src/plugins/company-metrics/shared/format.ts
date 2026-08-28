import type { MetricUnit } from "../contracts/types";

// Formatação de valor por unidade. Módulo folha (client-safe).
export function formatMetricValue(value: number, unit: MetricUnit): string {
  switch (unit) {
    case "currency_brl":
      return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
    case "percent":
      return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
    case "days":
      return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} d`;
    default:
      return value.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  }
}

export const METRIC_UNIT_LABELS: Record<MetricUnit, string> = {
  count: "Contagem",
  currency_brl: "Reais (R$)",
  percent: "Percentual (%)",
  days: "Dias",
};

export const METRIC_AGGREGATION_LABELS: Record<string, string> = {
  sum: "Somar os períodos",
  last: "Último valor do intervalo",
  average: "Média dos períodos",
};

export const METRIC_GRANULARITY_LABELS: Record<string, string> = {
  daily: "Diária",
  weekly: "Semanal",
  monthly: "Mensal",
};

export const METRIC_DIRECTION_LABELS: Record<string, string> = {
  up_good: "Quanto maior, melhor",
  down_good: "Quanto menor, melhor",
};

// Rótulo legível de um bucket "YYYY-MM-DD".
export function formatBucketLabel(periodStart: string, granularity: string): string {
  const [y, m, d] = periodStart.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  if (granularity === "monthly") {
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
  }
  if (granularity === "weekly") {
    const end = new Date(date);
    end.setUTCDate(end.getUTCDate() + 6);
    const startLabel = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" });
    const endLabel = end.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
    return `${startLabel} – ${endLabel}`;
  }
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
}
