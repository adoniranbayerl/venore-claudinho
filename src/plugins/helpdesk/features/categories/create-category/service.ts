import { beginOperation, endOperation } from "@/observability";
import { slugify } from "../../../shared/slugify";
import { categoryKeyExists, insertCategory, nextCategoryPosition, queueExists } from "./store";
import type { CreateCategoryCommand, CreateCategoryResult } from "./types";

async function uniqueCategoryKey(queueId: string, label: string): Promise<string> {
  const base = slugify(label) || "categoria";
  let candidate = base;
  let attempt = 1;
  while (await categoryKeyExists(queueId, candidate)) {
    attempt += 1;
    candidate = `${base}-${attempt}`;
  }
  return candidate;
}

export async function createCategory(command: CreateCategoryCommand): Promise<CreateCategoryResult> {
  if (!(await queueExists(command.queueId))) {
    return { success: false, error: { code: "helpdesk.create-category.queue_not_found", message: "Fila não encontrada." } };
  }

  const handle = beginOperation({
    useCase: "helpdesk.create-category",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  const [key, position] = await Promise.all([
    uniqueCategoryKey(command.queueId, command.label),
    nextCategoryPosition(command.queueId),
  ]);

  const record = await insertCategory({
    queueId: command.queueId,
    key,
    label: command.label.trim(),
    description: command.description?.trim() || null,
    position,
  });

  endOperation(handle, { success: true });
  return { success: true, data: record };
}
