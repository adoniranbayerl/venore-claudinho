// Superfície pública do plugin (barrel index.ts + contracts/) — o que outros plugins/temas/
// platform podem importar. Nada de store/service interno aqui.
// Ver docs/chamados-plugin.md §2.1 (Fase 1).

export const QUEUE_MEMBER_ROLES = ["manager", "agent"] as const;
export type QueueMemberRole = (typeof QUEUE_MEMBER_ROLES)[number];

// Uma fila / equipe de atendimento (TI, Manutenção… depois Zeladoria, Frota etc.). `key` é slug
// gerado do nome na criação, nunca digitado nem reeditável — vira parte da URL de painéis e do
// prefixo do número do chamado (`{key}-{seq}`), trocar depois quebraria um link já compartilhado.
// `icon` é nome de ícone lucide de uma lista fixa (só identidade visual). `archivedAt != null`
// esconde a fila das listagens sem apagar histórico.
export type QueueRecord = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  icon: string | null;
  position: number;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// Delegação por fila (§3). `userId` é `text` solto sem FK — o plugin não importa
// contexts/auth/database/schema; nome/e-mail resolvidos via @/contexts/auth `listUsers`. Uma
// linha por (fila, pessoa): a pessoa tem exatamente um papel na fila. `manager` configura a fila
// (categorias, membros `agent`) e atende; `agent` só atende. Estar aqui NÃO substitui a
// permission `helpdesk.work` — é restrição a mais sobre ela (ver shared/scoped-authorization).
export type QueueMemberRecord = {
  queueId: string;
  userId: string;
  role: QueueMemberRole;
  assignedAt: Date;
};

// Categoria opcional dentro de uma fila ("Rede", "Impressora", "Ar-condicionado", "Elétrica").
// `key` é slug gerado, único por fila. `archivedAt` aposenta a categoria sem quebrar chamados
// antigos. Prioridade padrão por categoria entra na Fase 4 (junto com o enum de prioridade).
export type CategoryRecord = {
  id: string;
  queueId: string;
  key: string;
  label: string;
  description: string | null;
  position: number;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
