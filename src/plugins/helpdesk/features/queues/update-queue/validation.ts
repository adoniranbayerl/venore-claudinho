import type { HelpdeskValidationError } from "../../../shared/validation-error";
import type { UpdateQueueInput } from "./types";

export function validateUpdateQueueInput(input: UpdateQueueInput): HelpdeskValidationError | null {
  if (!input.queueId || input.queueId.trim().length === 0) {
    return { code: "helpdesk.update-queue.missing_queue", message: "Fila não informada." };
  }
  if (input.name.trim().length === 0) {
    return { code: "helpdesk.update-queue.invalid_name", message: "O nome da fila não pode ser vazio." };
  }
  if (input.name.trim().length > 80) {
    return { code: "helpdesk.update-queue.name_too_long", message: "O nome da fila deve ter no máximo 80 caracteres." };
  }
  return null;
}
