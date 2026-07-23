import { db } from "@/infrastructure/database/client";
import { drainLogEntries, drainTraceEntries } from "./buffer";
import { getObservabilityConfig } from "./config";
import { observabilityLogEntries, observabilityTraceEntries } from "./database/schema";

export async function flushNow(): Promise<void> {
  const logEntries = drainLogEntries();
  const traceEntries = drainTraceEntries();

  if (logEntries.length > 0) {
    try {
      await db.insert(observabilityLogEntries).values(logEntries);
    } catch (error) {
      console.error("[observability] failed to flush log entries", error);
    }
  }

  if (traceEntries.length > 0) {
    try {
      await db.insert(observabilityTraceEntries).values(traceEntries);
    } catch (error) {
      console.error("[observability] failed to flush trace entries", error);
    }
  }
}

declare global {
  var __observabilityFlushTimer: ReturnType<typeof setInterval> | undefined;
}

export function startFlushScheduler(): void {
  if (globalThis.__observabilityFlushTimer) return;

  const { flushIntervalMs } = getObservabilityConfig();
  const timer = setInterval(() => {
    void flushNow();
  }, flushIntervalMs);
  timer.unref?.();
  globalThis.__observabilityFlushTimer = timer;
}

export function stopFlushScheduler(): void {
  if (globalThis.__observabilityFlushTimer) {
    clearInterval(globalThis.__observabilityFlushTimer);
    globalThis.__observabilityFlushTimer = undefined;
  }
}

if (process.env.NODE_ENV !== "test") {
  startFlushScheduler();
}
