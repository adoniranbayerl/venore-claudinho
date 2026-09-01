import { and, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/client";
import { slaPolicies } from "../database/schema";
import { DEFAULT_SLA_MINUTES } from "./sla";
import type { SlaPolicyRecord, TicketPriority } from "../contracts/types";

// Acesso a `sla_policies` compartilhado por features/sla/* (lê/grava), open-ticket e change-priority
// (leem para recalcular `sla_due_at`). Fora de um store.ts por feature de propósito — mesmo
// racional de shared/notification-store.ts: nenhuma feature é dona natural da tabela e a leitura
// nasce dentro de outros services.

export async function findSlaPoliciesForQueue(queueId: string): Promise<SlaPolicyRecord[]> {
  const rows = await db.select().from(slaPolicies).where(eq(slaPolicies.queueId, queueId));
  return rows.map((row) => ({ ...row, priority: row.priority as TicketPriority }));
}

// Minutos de resolução vigentes para (fila, prioridade): a política da fila, ou o padrão corrido de
// shared/sla.ts quando a fila não tem linha para a prioridade.
export async function resolveResolutionMinutes(queueId: string, priority: TicketPriority): Promise<number> {
  const [row] = await db
    .select({ resolutionMinutes: slaPolicies.resolutionMinutes })
    .from(slaPolicies)
    .where(and(eq(slaPolicies.queueId, queueId), eq(slaPolicies.priority, priority)))
    .limit(1);
  return row?.resolutionMinutes ?? DEFAULT_SLA_MINUTES[priority].resolutionMinutes;
}

export async function upsertSlaPolicy(input: {
  queueId: string;
  priority: TicketPriority;
  firstResponseMinutes: number;
  resolutionMinutes: number;
}): Promise<SlaPolicyRecord> {
  const [row] = await db
    .insert(slaPolicies)
    .values(input)
    .onConflictDoUpdate({
      target: [slaPolicies.queueId, slaPolicies.priority],
      set: {
        firstResponseMinutes: input.firstResponseMinutes,
        resolutionMinutes: input.resolutionMinutes,
        updatedAt: new Date(),
      },
    })
    .returning();
  return { ...row, priority: row.priority as TicketPriority };
}

export async function deleteSlaPolicy(queueId: string, priority: TicketPriority): Promise<void> {
  await db.delete(slaPolicies).where(and(eq(slaPolicies.queueId, queueId), eq(slaPolicies.priority, priority)));
}
