export type OperationKind = "read" | "write";

export type ActorRef = {
  id: string;
  type: string;
};

export type EventLevel = "info" | "warn" | "error" | "critical";
export type EventOutcome = "success" | "failure";

export type BeginOperationInput = {
  useCase: string;
  actor: ActorRef;
  kind: OperationKind;
  // Origem explícita ("context:rbac" / "plugin:academy") — quando omitida, é inferida do
  // prefixo de useCase via origin-registry.ts. Só precisa ser passada manualmente em casos que
  // fogem da convenção "<context-ou-plugin>.<feature>...".
  origin?: string;
};

export type OperationHandle = {
  operationId: string;
  useCase: string;
  actor: ActorRef;
  kind: OperationKind;
  origin: string;
  startedAt: Date;
};

// summary/detail/level são opcionais na chamada: quando omitidos, endOperation gera um resumo
// padrão a partir de useCase/actor/outcome (nunca fica sem summary no banco — campo obrigatório
// do modelo de evento) e deriva level de success/failure. Quem escreve um service novo é
// incentivado a passar `summary` explícito em linguagem natural (é o que a tela mostra na linha),
// e `detail` para o payload técnico que só aparece no expansível.
export type OperationOutcome =
  | { success: true; summary?: string; detail?: Record<string, unknown>; level?: EventLevel }
  | {
      success: false;
      error: { code: string; message: string };
      summary?: string;
      detail?: Record<string, unknown>;
      level?: EventLevel;
    };

export type EventRecord = {
  id: string;
  occurredAt: Date;
  level: EventLevel;
  origin: string;
  action: string;
  actorId: string | null;
  actorType: string | null;
  outcome: EventOutcome;
  summary: string;
  detail: Record<string, unknown> | null;
  errorCode: string | null;
  errorMessage: string | null;
  durationMs: number;
};

export type TraceEntryRecord = {
  id: string;
  useCase: string;
  actorId: string;
  success: boolean;
  durationMs: number;
  startedAt: Date;
};

// Auditoria de segurança: escrita síncrona e direta (não passa pelo buffer/flush em lote do log
// operacional) — é ação privilegiada de baixa frequência, prioriza durabilidade sobre throughput.
// Tabela separada (schema `audit`), sem expurgo automático nem botão de limpar.
export type AuditEventInput = {
  action: string;
  actor: ActorRef | null;
  outcome: EventOutcome;
  summary: string;
  detail?: Record<string, unknown>;
};

export type AuditEventRecord = {
  id: string;
  occurredAt: Date;
  action: string;
  actorId: string | null;
  actorType: string | null;
  outcome: EventOutcome;
  summary: string;
  detail: Record<string, unknown> | null;
};
