// Token de um quiosque (§2.5) — hex aleatório, nunca sequencial, vai no QR Code colado no setor.
// Mesmo formato do token de saída do broadcast: `crypto.randomUUID()` sem os hífens.
export function generateKioskToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

// `tracking_token` de um chamado anônimo (§2.5) — o link de acompanhamento que a pessoa guarda
// (`/chamados/acompanhar/[trackingToken]`). Mesmo formato, gerado uma vez na abertura pelo
// quiosque e nunca reemitido.
export function generateTrackingToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

// `token` de um painel de TV (Fase 6, §2.6) — vai na URL `/chamados/painel/[token]`. Mesmo
// formato (32 hex), gerado uma vez na criação do painel e nunca reemitido (pode estar numa
// playlist do broadcast ou salvo no navegador da TV).
export function generateBoardToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

// Aceita só o formato que geramos (32 hex) — barra ruído antes de qualquer query.
export function isWellFormedToken(value: string): boolean {
  return /^[0-9a-f]{32}$/.test(value);
}
