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

// "há X" legível em pt-BR a partir de um instante. Aceita Date ou string ISO.
export function formatRelativeTime(value: Date | string | null | undefined): string {
  if (!value) return "sem lançamento ainda";
  const date = value instanceof Date ? value : new Date(value);
  const ms = Date.now() - date.getTime();
  if (Number.isNaN(ms)) return "—";
  const min = Math.round(ms / 60000);
  if (min < 1) return "agora mesmo";
  if (min < 60) return `há ${min} min`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `há ${days} ${days === 1 ? "dia" : "dias"}`;
  if (days < 45) {
    const weeks = Math.round(days / 7);
    return `há ${weeks} ${weeks === 1 ? "semana" : "semanas"}`;
  }
  const months = Math.round(days / 30);
  return `há ${months} ${months === 1 ? "mês" : "meses"}`;
}

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
