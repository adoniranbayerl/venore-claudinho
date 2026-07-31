// Texto de "o que fazer" por família de código de erro — mostrado junto do erro na UI, não só o
// código cru. Sem entrada específica, cai no fallback genérico (nunca fica sem orientação).
const GUIDANCE_BY_PREFIX: { prefix: string; hint: string }[] = [
  { prefix: "rbac.authorization", hint: "Peça a um administrador para conceder a permission necessária, ou verifique se o login ainda é válido." },
  { prefix: "rbac.roles", hint: "Confirme se o papel/permission existe em Admin → RBAC antes de tentar de novo." },
  { prefix: "media", hint: "Verifique se o arquivo ainda existe e se não está em uso por outra página antes de repetir a ação." },
  { prefix: "cms", hint: "Confira se o conteúdo referenciado (entry, menu, categoria) não foi removido por outra pessoa nesse meio tempo." },
  { prefix: "observability.events.clear.confirmation_required", hint: "Confirme a exclusão para prosseguir — nenhum dado foi apagado ainda." },
];

export function getErrorGuidance(errorCode: string | null): string {
  if (!errorCode) return "Verifique os detalhes técnicos abaixo ou tente novamente em alguns instantes.";
  const match = GUIDANCE_BY_PREFIX.find((entry) => errorCode.startsWith(entry.prefix));
  return match?.hint ?? "Se o problema persistir, repita a ação; se continuar falhando, contate o suporte técnico com o horário e a ação exibidos nesta linha.";
}
