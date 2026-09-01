import { TICKET_PRIORITIES } from "../../../contracts/types";
import type { HelpdeskValidationError } from "../../../shared/validation-error";
import type { SetSlaPolicyInput } from "./types";

// Um dia corrido em minutos — teto generoso; acima disso quase certamente é erro de digitação
// (a pessoa quis horas, não minutos).
const MAX_MINUTES = 60 * 24 * 30;

export function validateSetSlaPolicyInput(input: SetSlaPolicyInput): HelpdeskValidationError | null {
  if (!input.queueId || input.queueId.trim().length === 0) {
    return { code: "helpdesk.set-sla-policy.missing_queue", message: "Fila não informada." };
  }
  if (!(TICKET_PRIORITIES as readonly string[]).includes(input.priority)) {
    return { code: "helpdesk.set-sla-policy.invalid_priority", message: "Prioridade inválida." };
  }
  for (const [field, value, label] of [
    ["firstResponseMinutes", input.firstResponseMinutes, "primeira resposta"],
    ["resolutionMinutes", input.resolutionMinutes, "resolução"],
  ] as const) {
    if (!Number.isInteger(value) || value <= 0) {
      return { code: `helpdesk.set-sla-policy.invalid_${field}`, message: `Informe os minutos de ${label} como um número inteiro positivo.` };
    }
    if (value > MAX_MINUTES) {
      return { code: `helpdesk.set-sla-policy.${field}_too_large`, message: `O prazo de ${label} é grande demais.` };
    }
  }
  if (input.firstResponseMinutes > input.resolutionMinutes) {
    return {
      code: "helpdesk.set-sla-policy.first_response_after_resolution",
      message: "O prazo de primeira resposta não pode ser maior que o de resolução.",
    };
  }
  return null;
}
