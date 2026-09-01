import { TICKET_PRIORITIES } from "../../../contracts/types";
import type { HelpdeskValidationError } from "../../../shared/validation-error";
import type { CreateQueueInput } from "./types";

export function validateCreateQueueInput(input: CreateQueueInput): HelpdeskValidationError | null {
  if (input.name.trim().length === 0) {
    return { code: "helpdesk.create-queue.invalid_name", message: "O nome da fila não pode ser vazio." };
  }
  if (input.name.trim().length > 80) {
    return { code: "helpdesk.create-queue.name_too_long", message: "O nome da fila deve ter no máximo 80 caracteres." };
  }
  if (input.defaultPriority !== undefined && !(TICKET_PRIORITIES as readonly string[]).includes(input.defaultPriority)) {
    return { code: "helpdesk.create-queue.invalid_priority", message: "Prioridade padrão inválida." };
  }
  return null;
}
