import type { OperationResult } from "@/shared/types";
import { listQueues } from "../features/queues/list-queues/service";
import { createQueue } from "../features/queues/create-queue/service";
import { createCategory } from "../features/categories/create-category/service";
import { findCategories } from "../features/categories/list-categories/store";

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

    const currentCategories = await findCategories(queueId, true);
    const existingLabels = new Set(currentCategories.map((category) => category.label.toLowerCase()));

    for (const label of seed.categories) {
      if (existingLabels.has(label.toLowerCase())) continue;
      const result = await createCategory({ queueId, label, actorId: SEED_ACTOR_ID });
      if (!result.success) {
        return { success: false, error: result.error };
      }
    }
  }

  return { success: true, data: undefined };
}
