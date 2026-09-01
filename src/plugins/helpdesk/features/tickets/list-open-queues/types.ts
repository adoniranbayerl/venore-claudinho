import type { OperationResult } from "@/shared/types";

// Filas (ativas) e suas categorias (ativas) para o formulário do portal `/chamados` — leitura
// self-service, sem permission de helpdesk (o solicitante escolhe a fila e a categoria opcional).
export type PortalQueueOption = {
  id: string;
  key: string;
  name: string;
  icon: string | null;
  categories: { id: string; label: string }[];
};

export type ListOpenQueuesResult = OperationResult<PortalQueueOption[]>;
