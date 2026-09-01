// Throttle ingênuo do endpoint anônimo do quiosque (§2.5 / AGENTS.md §7 — rate limiting real é
// gap da plataforma). Objetivo: impedir que um QR exposto vire torneira de chamados (alguém
// segurando o botão, script bobo), não resistir a um atacante determinado. Uma submissão por
// token a cada `KIOSK_SUBMIT_WINDOW_MS`.
//
// Estado em memória de processo, no `globalThis` (não uma variável de módulo) — Server Actions e
// Route Handlers podem cair em bundles/instâncias diferentes no Next; o singleton só sobrevive
// preso ao globalThis (mesma pegadinha de platform/... documentada no projeto). É best-effort: um
// restart/anova instância zera a janela, e tudo bem.

export const KIOSK_SUBMIT_WINDOW_MS = 30_000;

type ThrottleState = Map<string, number>;

const GLOBAL_KEY = "__helpdesk_kiosk_throttle__";

function store(): ThrottleState {
  const holder = globalThis as unknown as Record<string, ThrottleState | undefined>;
  holder[GLOBAL_KEY] ??= new Map<string, number>();
  return holder[GLOBAL_KEY]!;
}

export type ThrottleDecision = { allowed: true } | { allowed: false; retryAfterMs: number };

// Parte pura e testável: decide E registra a submissão sobre um mapa passado por fora.
export function evaluateThrottle(
  state: ThrottleState,
  token: string,
  now: number,
  windowMs: number = KIOSK_SUBMIT_WINDOW_MS,
): ThrottleDecision {
  const last = state.get(token);
  if (last !== undefined && now - last < windowMs) {
    return { allowed: false, retryAfterMs: windowMs - (now - last) };
  }
  state.set(token, now);

  // Faxina barata: descarta janelas já expiradas para o mapa não crescer sem limite.
  if (state.size > 500) {
    for (const [key, ts] of state) {
      if (now - ts >= windowMs) state.delete(key);
    }
  }
  return { allowed: true };
}

// Entrada de produção — usa o mapa preso ao globalThis.
export function registerKioskSubmission(token: string, now: number = Date.now()): ThrottleDecision {
  return evaluateThrottle(store(), token, now);
}
