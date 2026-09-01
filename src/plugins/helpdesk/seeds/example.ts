import type { OperationResult } from "@/shared/types";
import { listQueues } from "../features/queues/list-queues/service";
import { createQueue } from "../features/queues/create-queue/service";
import { createCategory } from "../features/categories/create-category/service";
import { findCategories } from "../features/categories/list-categories/store";
import { setSlaPolicy } from "../features/sla/set-sla-policy/service";
import { createKiosk } from "../features/kiosks/create-kiosk/service";
import { createBoard } from "../features/boards/create-board/service";
import { listKiosks } from "../shared/kiosk-store";
import { listBoards as listBoardRecords } from "../shared/board-store";
import { DEFAULT_SLA_MINUTES } from "../shared/sla";
import { TICKET_PRIORITIES } from "../contracts/types";

// Dados de exemplo do plugin. Idempotente: pula fila já existente pelo nome e categoria já
// existente pelo label. Chama service.ts direto — sem sessão/ator neste caminho; SEED_ACTOR_ID é
// só rótulo de auditoria. Fases seguintes estendem esta função.
const SEED_ACTOR_ID = "system-seed";

const SEED_QUEUES: { name: string; description: string; icon: string; categories: string[] }[] = [
  {
    name: "TI",
    description: "Suporte a computadores, rede, sistemas e acessos.",
    icon: "wrench",
    categories: ["Computador / Notebook", "Rede / Internet", "Impressora", "Sistema / Acesso", "E-mail"],
  },
  {
    name: "Manutenção",
    description: "Reparos prediais, elétrica, hidráulica e mobiliário.",
    icon: "wrench",
    categories: ["Elétrica", "Hidráulica", "Ar-condicionado", "Mobiliário", "Estrutura / Alvenaria"],
  },
];

export async function seedHelpdeskExample(): Promise<OperationResult<void>> {
  const existing = await listQueues({ includeArchived: true });
  if (!existing.success) {
    return { success: false, error: existing.error };
  }
  const queueIdByName = new Map(existing.data.map((queue) => [queue.name.toLowerCase(), queue.id]));
  let manutencaoQueueId: string | undefined;

  for (const seed of SEED_QUEUES) {
    let queueId = queueIdByName.get(seed.name.toLowerCase());
    if (!queueId) {
      const created = await createQueue({
        name: seed.name,
        description: seed.description,
        icon: seed.icon,
        actorId: SEED_ACTOR_ID,
      });
      if (!created.success) {
        return { success: false, error: created.error };
      }
      queueId = created.data.id;
    }
    if (seed.name === "Manutenção") manutencaoQueueId = queueId;

    const currentCategories = await findCategories(queueId, true);
    const existingLabels = new Set(currentCategories.map((category) => category.label.toLowerCase()));

    for (const label of seed.categories) {
      if (existingLabels.has(label.toLowerCase())) continue;
      const result = await createCategory({ queueId, label, actorId: SEED_ACTOR_ID });
      if (!result.success) {
        return { success: false, error: result.error };
      }
    }

    // Fase 4 — política de SLA de exemplo (o padrão corrido de shared/sla.ts, explicitado por
    // fila para o sla-editor já abrir preenchido). `setSlaPolicy` é upsert → idempotente.
    for (const priority of TICKET_PRIORITIES) {
      const result = await setSlaPolicy({
        queueId,
        priority,
        firstResponseMinutes: DEFAULT_SLA_MINUTES[priority].firstResponseMinutes,
        resolutionMinutes: DEFAULT_SLA_MINUTES[priority].resolutionMinutes,
        actorId: SEED_ACTOR_ID,
      });
      if (!result.success) {
        return { success: false, error: result.error };
      }
    }
  }

  // Fase 5 — um quiosque de exemplo (§6), fixado na fila Manutenção. Idempotente pelo label.
  const SEED_KIOSK_LABEL = "Recepção — Manutenção";
  const kiosks = await listKiosks();
  if (!kiosks.some((kiosk) => kiosk.label.toLowerCase() === SEED_KIOSK_LABEL.toLowerCase())) {
    const created = await createKiosk({
      label: SEED_KIOSK_LABEL,
      queueId: manutencaoQueueId ?? null,
      defaultLocation: "Recepção",
      actorId: SEED_ACTOR_ID,
    });
    if (!created.success) {
      return { success: false, error: created.error };
    }
  }

  // Fase 6 — um painel de TV de exemplo (§6): kanban de todas as filas. Idempotente pelo label.
  const SEED_BOARD_LABEL = "Painel geral — Chamados";
  const boards = await listBoardRecords();
  if (!boards.some((board) => board.label.toLowerCase() === SEED_BOARD_LABEL.toLowerCase())) {
    const created = await createBoard({
      label: SEED_BOARD_LABEL,
      queueId: null,
      layout: "kanban",
      showAssignee: true,
      refreshSeconds: 20,
      actorId: SEED_ACTOR_ID,
    });
    if (!created.success) {
      return { success: false, error: created.error };
    }
  }

  return { success: true, data: undefined };
}
