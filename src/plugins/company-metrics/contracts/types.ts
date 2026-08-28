// Superfície pública do plugin (barrel index.ts + contracts/) — o que outros plugins/temas/
// platform podem importar. Nada de store/service interno aqui.

export const SECTOR_MEMBER_ROLES = ["admin", "editor", "viewer"] as const;
export type SectorMemberRole = (typeof SECTOR_MEMBER_ROLES)[number];

// Um setor da empresa (comercial, financeiro, marketing… depois RH, secretaria, almoxarifado,
// pedagógico). `key` é slug gerado do nome na criação, nunca digitado nem reeditável — vira parte
// de URL (telas de TV) e identificador estável entre reordenações.
export type SectorRecord = {
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

// Agrupamento opcional dentro de um setor, com rótulo/logo/ordem próprios. Absorve "instituição"
// do antigo enrollment-dashboard e serve genérico ("Regional Sul", "Matriz/Filial"). `key` é slug
// gerado, único por setor.
export type SectorGroupRecord = {
  id: string;
  sectorId: string;
  key: string;
  label: string;
  logoMediaId: string | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};

// Delegação: quem pode o quê num setor. `userId` é texto solto sem FK (plugin não importa
// contexts/auth/database/schema — regra 7/8 do AGENTS.md); nome/e-mail resolvidos via
// @/contexts/auth (listUsers). Estar aqui não substitui a permission company-metrics.contribute —
// é restrição A MAIS sobre ela (ver shared/scoped-authorization).
export type SectorMemberRecord = {
  sectorId: string;
  userId: string;
  role: SectorMemberRole;
  assignedAt: Date;
};
