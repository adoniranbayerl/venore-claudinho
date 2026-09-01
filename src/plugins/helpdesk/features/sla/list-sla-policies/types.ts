import type { OperationResult } from "@/shared/types";
import type { SlaPolicyRecord, TicketPriority } from "../../../contracts/types";

// Uma linha por prioridade, SEMPRE as quatro: `source: "policy"` quando a fila configurou, ou
// `"default"` (padrão corrido de shared/sla.ts) quando não. É o que o sla-editor renderiza.
export type SlaPolicyRow = {
  priority: TicketPriority;
  firstResponseMinutes: number;
  resolutionMinutes: number;
  source: "policy" | "default";
};

export type ListSlaPoliciesResult = OperationResult<{ queueId: string; rows: SlaPolicyRow[]; raw: SlaPolicyRecord[] }>;
