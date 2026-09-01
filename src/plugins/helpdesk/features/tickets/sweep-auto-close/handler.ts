import { authorizeActor } from "@/contexts/rbac";
import { sweepAutoClose } from "./service";
import type { SweepAutoCloseResult } from "./service";

// Igual a sweep-sla-at-risk: sem scheduler no v1 (§8), roda no batimento do polling de
// notificações. Não é uma ação do ator — o efeito é só fechar chamados `resolved` cuja janela de
// reabertura de N dias já venceu. Exige uma das permissions de Chamados (quem chama o endpoint de
// notificações já tem); sem acesso devolve `{ closed: 0 }`, sem erro.
export async function sweepAutoCloseHandler(): Promise<SweepAutoCloseResult> {
  const actor = await authorizeActor(["helpdesk.manage", "helpdesk.work", "helpdesk.read"]);
  if (!actor.authorized) {
    return { success: true, data: { closed: 0 } };
  }
  return sweepAutoClose();
}
