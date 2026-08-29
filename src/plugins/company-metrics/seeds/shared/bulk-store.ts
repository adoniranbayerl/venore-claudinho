import { db } from "@/infrastructure/database/client";
import {
  metricDefinitions,
  metricValues,
  sectorGroups,
  sectors,
  targetInputs,
  targets,
  tvBoards,
  tvScreens,
} from "../../database/schema";

// Inserts em lote — só pro seed grande (dados confiáveis, sem validação por linha; evita
// centenas de round-trips pelos service.ts). Acesso direto ao db fora de um store por feature:
// exceção deliberada, mesmo racional de seeds/example.ts chamar service.ts direto.
const CHUNK = 400;

function chunks<T>(rows: T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < rows.length; i += CHUNK) out.push(rows.slice(i, i + CHUNK));
  return out;
}

export async function bulkInsertSectors(
  rows: { id: string; key: string; name: string; description: string | null; icon: string | null; position: number }[],
): Promise<void> {
  for (const slice of chunks(rows)) await db.insert(sectors).values(slice);
}

export async function bulkInsertSectorGroups(
  rows: { id: string; sectorId: string; key: string; label: string; logoMediaId: string | null; position: number }[],
): Promise<void> {
  for (const slice of chunks(rows)) await db.insert(sectorGroups).values(slice);
}

export async function bulkInsertMetricDefinitions(
  rows: {
    id: string;
    sectorId: string;
    groupId: string | null;
    key: string;
    label: string;
    description: string | null;
    unit: string;
    aggregation: string;
    granularity: string;
    direction: string;
    position: number;
  }[],
): Promise<void> {
  for (const slice of chunks(rows)) await db.insert(metricDefinitions).values(slice);
}

export async function bulkInsertTargets(
  rows: {
    id: string;
    sectorId: string;
    groupId: string | null;
    label: string;
    description: string | null;
    targetValue: number;
    periodStart: string;
    periodEnd: string;
    onTrackThreshold: number;
    position: number;
  }[],
): Promise<void> {
  for (const slice of chunks(rows)) await db.insert(targets).values(slice);
}

export async function bulkInsertTargetInputs(
  rows: { targetId: string; definitionId: string; weight: number; classification: string; position: number }[],
): Promise<void> {
  for (const slice of chunks(rows)) await db.insert(targetInputs).values(slice);
}

export async function bulkInsertMetricValues(
  rows: { definitionId: string; periodStart: string; value: number; enteredByUserId: string }[],
): Promise<void> {
  for (const slice of chunks(rows)) await db.insert(metricValues).values(slice).onConflictDoNothing();
}

export async function bulkInsertTvBoards(rows: { id: string; token: string; label: string }[]): Promise<void> {
  for (const slice of chunks(rows)) await db.insert(tvBoards).values(slice);
}

export async function bulkInsertTvScreens(
  rows: {
    id: string;
    boardId: string;
    kind: string;
    sectorId: string | null;
    targetId: string | null;
    definitionId: string | null;
    dwellSeconds: number;
    position: number;
  }[],
): Promise<void> {
  for (const slice of chunks(rows)) await db.insert(tvScreens).values(slice);
}
