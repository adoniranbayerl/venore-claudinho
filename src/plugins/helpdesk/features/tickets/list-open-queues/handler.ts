import { getCurrentUser } from "@/contexts/auth";
import { listOpenQueues } from "./service";
import type { ListOpenQueuesResult } from "./types";

// Self-service — só exige sessão (o portal `/chamados` já exige estar logado). Não expõe filas
// arquivadas nem contagem de equipe: é só o que o formulário de abertura precisa.
export async function listOpenQueuesHandler(): Promise<ListOpenQueuesResult> {
  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    return { success: false, error: { code: "helpdesk.list-open-queues.unauthenticated", message: "É necessário estar autenticado." } };
  }

  return listOpenQueues();
}
