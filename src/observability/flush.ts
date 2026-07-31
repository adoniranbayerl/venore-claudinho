import { db } from "@/infrastructure/database/client";
import { drainEvents, drainTraceEntries } from "./buffer";
import { getObservabilityConfig } from "./config";
import { observabilityEvents, observabilityTraceEntries } from "./database/schema";

export async function flushNow(): Promise<void> {
  const events = drainEvents();
  const traceEntries = drainTraceEntries();

  if (events.length > 0) {
    try {
      await db.insert(observabilityEvents).values(events);
    } catch (error) {
      console.error("[observability] failed to flush events", error);
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
