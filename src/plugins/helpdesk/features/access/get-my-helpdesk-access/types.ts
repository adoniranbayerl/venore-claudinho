import type { OperationResult } from "@/shared/types";

export type HelpdeskAccess = {
  // helpdesk.manage — configura e vê tudo, delega gestores.
  canManageAll: boolean;
  // helpdesk.manage OU helpdesk.read — vê a fila e a timeline de qualquer chamado (sem agir).
  canReadAll: boolean;
  // Filas em que a pessoa é membro "manager" (configura categorias e delega agentes).
  managerQueueIds: string[];
  // Todas as filas em que é membro, qualquer papel (aparece na aba Fila e atende).
  memberQueueIds: string[];
};

export type GetMyHelpdeskAccessResult = OperationResult<HelpdeskAccess>;
