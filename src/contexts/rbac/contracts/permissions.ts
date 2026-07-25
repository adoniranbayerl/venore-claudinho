import type { PermissionDefinition } from "./types";

export const RBAC_PERMISSIONS: PermissionDefinition[] = [
  { key: "rbac.roles.manage", label: "Gerenciar papéis e permissions" },
  { key: "rbac.roles.assign", label: "Atribuir papéis a usuários" },
  { key: "rbac.registrations.approve", label: "Aprovar registros pendentes" },
  // Pertence conceitualmente a contexts/settings — mora aqui porque ainda não existe agregação
  // de permissions entre contexts (docs/venore-docks.md — Modelo de RBAC).
  { key: "settings.manage", label: "Alterar configurações do site" },
  // Pertence conceitualmente a contexts/cms — mesmo stopgap de settings.manage acima.
  { key: "cms.content-types.manage", label: "Gerenciar content types do CMS" },
  { key: "cms.categories.manage", label: "Gerenciar categorias do CMS" },
  { key: "cms.entries.manage", label: "Gerenciar entries do CMS" },
  { key: "cms.menus.manage", label: "Gerenciar menus do CMS" },
  // Pertence conceitualmente ao admin shell (platform/), não a um único context de domínio —
  // mesmo stopgap das entradas acima, até existir agregação de permissions entre contexts.
  { key: "platform.admin.access", label: "Acessar área administrativa" },
  // Pertence conceitualmente a contexts/media — mesmo stopgap de settings.manage acima.
  { key: "media.manage", label: "Gerenciar arquivos de mídia" },
  // Pertence conceitualmente a observability/ (infraestrutura técnica, não um context de
  // domínio) — mesmo stopgap das entradas acima.
  { key: "observability.logs.view", label: "Ver logs de observabilidade" },
];
