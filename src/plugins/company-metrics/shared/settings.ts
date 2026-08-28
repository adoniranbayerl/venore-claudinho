// Settings do plugin declaradas no manifesto (registerPlugins chama registerDefaultSetting por
// setting de plugin ativo). Módulo folha — pode ser importado por client component.
export const COMPANY_METRICS_SETTINGS = {
  timezone: {
    key: "company-metrics.timezone",
    // America/Sao_Paulo sem horário de verão desde 2019 — offset fixo -03:00. Nada no código
    // assume isso (shared/period.ts usa o id, não o texto).
    defaultValue: "America/Sao_Paulo",
  },
} as const;

export const DEFAULT_COMPANY_METRICS_TIMEZONE = COMPANY_METRICS_SETTINGS.timezone.defaultValue;

// Rótulo por cidade conhecida, nunca o id IANA cru (memory feedback_admin_ux_no_dev_jargon).
export const COMPANY_METRICS_TIMEZONE_OPTIONS: { value: string; label: string }[] = [
  { value: "America/Sao_Paulo", label: "Curitiba / Brasília / São Paulo (GMT-3)" },
  { value: "America/Bahia", label: "Salvador / Recife / Fortaleza (GMT-3)" },
  { value: "America/Manaus", label: "Manaus / Cuiabá / Campo Grande (GMT-4)" },
  { value: "America/Rio_Branco", label: "Rio Branco / Acre (GMT-5)" },
  { value: "America/Noronha", label: "Fernando de Noronha (GMT-2)" },
  { value: "UTC", label: "UTC (GMT+0)" },
];

export function isValidTimeZone(value: string): boolean {
  if (!value) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function normalizeTimeZone(value: unknown): string {
  return typeof value === "string" && isValidTimeZone(value) ? value : DEFAULT_COMPANY_METRICS_TIMEZONE;
}
