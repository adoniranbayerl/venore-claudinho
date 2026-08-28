// Mesmo formato de enrollment-dashboard/shared/validation-error.ts — erro de validação de borda,
// devolvido pelo handler.ts como OperationResult.error antes de chamar authorizeActor/service.
export type CompanyMetricsValidationError = { code: string; message: string };
