// Redação acontece na origem (aqui, antes do insert), não na exibição — pedido explícito: um
// evento gravado sem redação já vazou o dado, mesmo que a tela seja corrigida depois.
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
// Bearer tokens, JWTs (three base64url segments) e chave=valor de segredo comuns.
const BEARER_PATTERN = /\bBearer\s+[A-Za-z0-9._-]+/gi;
const JWT_PATTERN = /\b[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g;

// "authorization" fica de fora daqui de propósito: BEARER_PATTERN já cobre "Authorization:
// Bearer <token>" — incluí-la aqui faria o valor "Bearer" (já redigido acima) virar o "segredo"
// capturado, corrompendo a frase. Redação exata de campo "authorization" em objetos estruturados
// continua coberta por SENSITIVE_DETAIL_KEYS, que compara a chave inteira, não um recorte de texto.
const SENSITIVE_KEY_PATTERN = /\b(password|senha|token|secret|apikey|api_key|credential|access_token|refresh_token)\s*[:=]\s*["']?[^\s"',}]+/gi;

const SENSITIVE_DETAIL_KEYS = new Set([
  "password",
  "senha",
  "token",
  "secret",
  "apikey",
  "api_key",
  "authorization",
  "credential",
  "accesstoken",
  "access_token",
  "refreshtoken",
  "refresh_token",
]);

export function redactText(input: string): string {
  return input
    .replace(BEARER_PATTERN, "Bearer [REDACTED]")
    .replace(JWT_PATTERN, "[REDACTED]")
    .replace(SENSITIVE_KEY_PATTERN, (match, key: string) => `${key}=[REDACTED]`)
    .replace(EMAIL_PATTERN, "[REDACTED_EMAIL]");
}

export function redactDetail(detail: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(detail)) {
    if (SENSITIVE_DETAIL_KEYS.has(key.toLowerCase())) {
      result[key] = "[REDACTED]";
      continue;
    }
    if (typeof value === "string") {
      result[key] = redactText(value);
      continue;
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = redactDetail(value as Record<string, unknown>);
      continue;
    }
    result[key] = value;
  }
  return result;
}
