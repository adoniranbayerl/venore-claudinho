import { db } from "@/infrastructure/database/client";
import { securityAuditEvents } from "./database/schema";
import { redactDetail, redactText } from "./redaction";
import type { AuditEventInput } from "./contracts/types";

// Auditoria de segurança: insert síncrono e direto, sem buffer/flush em lote (diferente do log
// operacional — ver operation-log.ts). Justificativa: ação privilegiada, baixíssima frequência
// comparada ao volume de logs operacionais, e aqui durabilidade importa mais que throughput —
// perder um evento de auditoria no buffer em caso de crash do processo não é aceitável. Nenhum
// outro ponto do sistema escreve em security_audit_events; é sempre via esta função (mesmo
// princípio de "gravado pela porta, nunca por INSERT espalhado" pedido para o log operacional).
export async function recordAuditEvent(input: AuditEventInput): Promise<void> {
  await db.insert(securityAuditEvents).values({
    id: crypto.randomUUID(),
    occurredAt: new Date(),
    action: input.action,
    actorId: input.actor?.id ?? null,
    actorType: input.actor?.type ?? null,
    outcome: input.outcome,
    summary: redactText(input.summary),
    detail: input.detail ? redactDetail(input.detail) : null,
  });
}
