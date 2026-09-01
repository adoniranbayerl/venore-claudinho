import { authorizeActor } from "@/contexts/rbac";
import { sweepSlaAtRisk } from "./service";
import type { SweepSlaAtRiskResult } from "./service";

// Sem scheduler no v1 (§8), a varredura de SLA roda no batimento do polling de notificações. Não
// é uma ação do ator: o único efeito é gravar `sla_at_risk` para chamados que JÁ cruzaram 80 % do
// prazo. Ainda assim exige uma das permissions de Chamados (quem chama o endpoint de notificações
// já as tem) — um usuário sem acesso a Chamados só recebe `{ created: 0 }`, sem erro.
export async function sweepSlaAtRiskHandler(): Promise<SweepSlaAtRiskResult> {
  const actor = await authorizeActor(["helpdesk.manage", "helpdesk.work", "helpdesk.read"]);
  if (!actor.authorized) {
    return { success: true, data: { created: 0 } };
  }
  return sweepSlaAtRisk();
}
