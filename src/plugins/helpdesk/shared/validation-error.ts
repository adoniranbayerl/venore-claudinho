// Mesmo formato de company-metrics/shared/validation-error.ts — erro de validação de borda,
// devolvido pelo handler.ts como OperationResult.error antes de chamar authorizeActor/service.
export type HelpdeskValidationError = { code: string; message: string };
