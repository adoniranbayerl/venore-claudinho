import { beginOperation, endOperation } from "@/observability";
import { slugify } from "../../../shared/slugify";
import { insertQueue, nextQueuePosition, queueKeyExists } from "./store";
import type { CreateQueueCommand, CreateQueueResult } from "./types";

// key gerada do nome e nunca reexposta pra edição — vira parte da URL dos painéis e do prefixo do
// número do chamado, trocar depois quebraria um link/impressão já em uso. Sufixo numérico só
// resolve colisão.
async function uniqueQueueKey(name: string): Promise<string> {
  const base = slugify(name) || "fila";
  let candidate = base;
  let attempt = 1;
  while (await queueKeyExists(candidate)) {
    attempt += 1;
    candidate = `${base}-${attempt}`;
  }
  return candidate;
}

export async function createQueue(command: CreateQueueCommand): Promise<CreateQueueResult> {
  const handle = beginOperation({
    useCase: "helpdesk.create-queue",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const [key, position] = await Promise.all([uniqueQueueKey(command.name), nextQueuePosition()]);

  const record = await insertQueue({
    key,
    name: command.name.trim(),
    description: command.description?.trim() || null,
    icon: command.icon?.trim() || null,
    position,
  });

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
