function readIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function readRateEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : fallback;
}

export function getObservabilityConfig() {
  return {
    flushIntervalMs: readIntEnv("OBSERVABILITY_FLUSH_INTERVAL_MS", 5000),
    flushBatchSize: readIntEnv("OBSERVABILITY_FLUSH_BATCH_SIZE", 50),
    traceSampleRate: readRateEnv("OBSERVABILITY_TRACE_SAMPLE_RATE", 0),
    // Retenção do log operacional (não se aplica a security_audit_events — auditoria não expurga).
    retentionDays: readIntEnv("OBSERVABILITY_RETENTION_DAYS", 30),
    maxEventVolume: readIntEnv("OBSERVABILITY_MAX_EVENT_VOLUME", 200_000),
    retentionIntervalMs: readIntEnv("OBSERVABILITY_RETENTION_INTERVAL_MS", 24 * 60 * 60 * 1000),
  };
}
