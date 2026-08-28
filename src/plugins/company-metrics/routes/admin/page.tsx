import { listUsers } from "@/contexts/auth";
import { AdminAccessDenied } from "@/components/admin-access-denied";
import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { getCompanyMetricsPageData } from "@/platform/admin-shell/get-company-metrics-page-data";
import {
  listSectorGroups,
  listSectorMembers,
  listSectors,
  type SectorListItem,
} from "@/plugins/company-metrics";
import type { SectorGroupRecord, SectorMemberRecord } from "@/plugins/company-metrics/contracts/types";
import { ArchiveSectorButton } from "./archive-sector-button";
import { CreateSectorDialog } from "./create-sector-dialog";
import { EditSectorDialog } from "./edit-sector-dialog";
import { SectorGroupsDialog } from "./sector-groups-dialog";
import { SectorIcon } from "./sector-icon";
import { SectorMembersDialog } from "./sector-members-dialog";

export default async function CompanyMetricsAdminPage() {
  const gate = await getCompanyMetricsPageData();
  if (!gate.granted) {
    return <AdminAccessDenied message="Você não tem permissão para ver Métricas Internas." />;
  }

  const canManage = gate.actor.isSuperadmin || gate.actor.permissions.includes("company-metrics.manage");

  const sectorsResult = await listSectors({ includeArchived: true });
  if (!sectorsResult.success) {
    return <p className="text-sm text-destructive">Erro ao carregar os setores: {sectorsResult.error.message}</p>;
  }
  const sectors = sectorsResult.data;

  const [groupsResult, usersResult, ...membersResults] = await Promise.all([
    listSectorGroups(),
    listUsers(),
    ...sectors.map((sector) => listSectorMembers(sector.id)),
  ]);

  const groupsBySector = new Map<string, SectorGroupRecord[]>();
  if (groupsResult.success) {
    for (const group of groupsResult.data) {
      const list = groupsBySector.get(group.sectorId) ?? [];
      list.push(group);
      groupsBySector.set(group.sectorId, list);
    }
  }

  const membersBySector = new Map<string, SectorMemberRecord[]>();
  sectors.forEach((sector, index) => {
    const result = membersResults[index];
    membersBySector.set(sector.id, result?.success ? result.data : []);
  });

  const users = usersResult.success ? usersResult.data.map((user) => ({ id: user.id, name: user.name, email: user.email })) : [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Métricas Internas"
        description="Setores da empresa, com seus responsáveis e grupos. Métricas, metas e telas de TV entram nas próximas etapas."
        actions={canManage && sectors.length > 0 ? <CreateSectorDialog /> : undefined}
      />

      {sectors.length === 0 ? (
        <EmptyState
          title="Nenhum setor ainda"
          description={
            canManage
              ? "Crie o primeiro setor (comercial, financeiro, marketing…) para começar."
              : "Você ainda não é responsável por nenhum setor. Peça a um administrador para atribuir você."
          }
          action={canManage ? <CreateSectorDialog /> : undefined}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {sectors.map((sector) => (
            <SectorCard
              key={sector.id}
              sector={sector}
              canManage={canManage}
              groups={groupsBySector.get(sector.id) ?? []}
              members={membersBySector.get(sector.id) ?? []}
              users={users}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function SectorCard({
  sector,
  canManage,
  groups,
  members,
  users,
}: {
  sector: SectorListItem;
  canManage: boolean;
  groups: SectorGroupRecord[];
  members: SectorMemberRecord[];
  users: { id: string; name: string | null; email: string }[];
}) {
  const archived = sector.archivedAt !== null;

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/14 text-primary">
          <SectorIcon icon={sector.icon} className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">{sector.name}</h2>
            {archived && <Badge variant="outline">Arquivado</Badge>}
          </div>
          {sector.description && <p className="mt-0.5 text-sm text-muted-foreground">{sector.description}</p>}
          <p className="mt-1 text-xs text-muted-foreground/56">
            {sector.memberCount} {sector.memberCount === 1 ? "responsável" : "responsáveis"} · {sector.groupCount}{" "}
            {sector.groupCount === 1 ? "grupo" : "grupos"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <EditSectorDialog sector={sector} />
        <SectorMembersDialog
          sectorId={sector.id}
          sectorName={sector.name}
          allUsers={users}
          members={members.map((member) => ({ userId: member.userId, role: member.role }))}
          canManageAdmins={canManage}
        />
        <SectorGroupsDialog sectorId={sector.id} sectorName={sector.name} groups={groups} />
        {canManage && <ArchiveSectorButton sectorId={sector.id} archived={archived} />}
      </div>
    </li>
  );
}
