import { authorizeActor, type AuthorizeActorResult } from "@/contexts/rbac";
import type { SectorMemberRole } from "../../contracts/types";
import {
  findSectorIdByDefinitionId,
  findSectorIdByGroupId,
  findSectorIdByTargetId,
  findSectorIdsForUser,
  findSectorMemberRole,
  roleSatisfies,
} from "./store";

// Camada de autorização por setor — espelha broadcast/shared/scoped-authorization/index.ts.
// company-metrics.manage sempre passa (todos os setores, ignora atribuição). Quem só tem a
// permission estreita (company-metrics.contribute) precisa das DUAS coisas: a permission (via
// papel em /admin/rbac) E uma linha em sector_members com papel suficiente. A atribuição sozinha
// nunca basta.

const FORBIDDEN_SECTOR = {
  code: "company-metrics.sector.forbidden_resource",
  message: "Você só tem acesso aos setores atribuídos a você.",
} as const;

export async function authorizeSectorActor(sectorId: string, min: SectorMemberRole): Promise<AuthorizeActorResult> {
  const full = await authorizeActor("company-metrics.manage");
  if (full.authorized) return full;

  const scoped = await authorizeActor("company-metrics.contribute");
  if (!scoped.authorized) return scoped;

  const role = await findSectorMemberRole(sectorId, scoped.actorId);
  if (!roleSatisfies(role, min)) return { authorized: false, error: FORBIDDEN_SECTOR };
  return scoped;
}

// Configurar setor/grupo/definição/meta exige papel "admin" no setor (ou company-metrics.manage).
export function authorizeSectorConfigActor(sectorId: string): Promise<AuthorizeActorResult> {
  return authorizeSectorActor(sectorId, "admin");
}

// Lançar valores (Fase 2) exige papel "editor" pra cima.
export function authorizeSectorContributionActor(sectorId: string): Promise<AuthorizeActorResult> {
  return authorizeSectorActor(sectorId, "editor");
}

export type ManageableSectors =
  | { scope: "all" }
  | { scope: "scoped"; sectorIds: string[] }
  | { scope: "none" };

// Recorte de listagem no admin: company-metrics.manage → todos; company-metrics.contribute → só
// os setores em que a pessoa é membro (qualquer papel); nenhuma das duas → none (o handler
// devolve 403).
export async function resolveManageableSectors(): Promise<ManageableSectors> {
  const full = await authorizeActor("company-metrics.manage");
  if (full.authorized) return { scope: "all" };

  const scoped = await authorizeActor("company-metrics.contribute");
  if (!scoped.authorized) return { scope: "none" };

  return { scope: "scoped", sectorIds: await findSectorIdsForUser(scoped.actorId) };
}

// Resolve o setor pai e autoriza como configuração — pra features que só recebem groupId.
export async function authorizeSectorGroupConfigActor(groupId: string): Promise<AuthorizeActorResult> {
  const sectorId = await findSectorIdByGroupId(groupId);
  if (!sectorId) {
    return { authorized: false, error: { code: "company-metrics.sector-group.not_found", message: "Grupo não encontrado." } };
  }
  return authorizeSectorConfigActor(sectorId);
}

// Configurar/arquivar uma definição de métrica = papel "admin" no setor dono (ou manage).
export async function authorizeMetricDefinitionConfigActor(definitionId: string): Promise<AuthorizeActorResult> {
  const sectorId = await findSectorIdByDefinitionId(definitionId);
  if (!sectorId) {
    return { authorized: false, error: { code: "company-metrics.metric-definition.not_found", message: "Métrica não encontrada." } };
  }
  return authorizeSectorConfigActor(sectorId);
}

// Lançar valor de uma definição = papel "editor" pra cima no setor dono (ou manage).
export async function authorizeMetricValueContributionActor(definitionId: string): Promise<AuthorizeActorResult> {
  const sectorId = await findSectorIdByDefinitionId(definitionId);
  if (!sectorId) {
    return { authorized: false, error: { code: "company-metrics.metric-definition.not_found", message: "Métrica não encontrada." } };
  }
  return authorizeSectorContributionActor(sectorId);
}

// Configurar/apagar uma meta = papel "admin" no setor dono (ou manage).
export async function authorizeTargetConfigActor(targetId: string): Promise<AuthorizeActorResult> {
  const sectorId = await findSectorIdByTargetId(targetId);
  if (!sectorId) {
    return { authorized: false, error: { code: "company-metrics.target.not_found", message: "Meta não encontrada." } };
  }
  return authorizeSectorConfigActor(sectorId);
}

export {
  findSectorById,
  findSectorIdByDefinitionId,
  findSectorIdByGroupId,
  findSectorIdByTargetId,
  findSectorIdByValueId,
  findSectorIdsForUser,
  findSectorMemberRole,
  roleSatisfies,
} from "./store";
