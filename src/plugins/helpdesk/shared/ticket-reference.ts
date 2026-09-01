// Número exibido do chamado = `{queue.key}-{seq}` (ex: `ti-1042`, `manutencao-87`). A `key` da
// fila é slug (só [a-z0-9-], gerada em create-queue), então o último `-` separa o slug do número.
// Usado na URL `/chamados/:ticketRef` — o componente da rota faz o parse e resolve a fila + seq.

export type ParsedTicketReference = { queueKey: string; seq: number };

export function formatTicketReference(input: { queueKey: string; seq: number }): string {
  return `${input.queueKey}-${input.seq}`;
}

export function parseTicketReference(reference: string): ParsedTicketReference | null {
  const trimmed = reference.trim().toLowerCase();
  const match = /^([a-z0-9]+(?:-[a-z0-9]+)*)-(\d+)$/.exec(trimmed);
  if (!match) return null;

  const seq = Number(match[2]);
  if (!Number.isInteger(seq) || seq <= 0) return null;

  return { queueKey: match[1], seq };
}
