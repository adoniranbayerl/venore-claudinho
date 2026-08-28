import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import type { SectorGroupRecord, SectorMemberRecord } from "@/plugins/company-metrics/contracts/types";
import type { SectorListItem } from "@/plugins/company-metrics";
import { ArchiveSectorButton } from "./archive-sector-button";
import { CreateSectorDialog } from "./create-sector-dialog";
import { EditSectorDialog } from "./edit-sector-dialog";
import { SectorGroupsDialog } from "./sector-groups-dialog";
import { SectorIcon } from "./sector-icon";
import { SectorMembersDialog } from "./sector-members-dialog";

type UserOption = { id: string; name: string | null; email: string };

export function SetoresView({
  sectors,
  groupsBySector,
  membersBySector,
  users,
  canManage,
}: {
  sectors: SectorListItem[];
  groupsBySector: Map<string, SectorGroupRecord[]>;
  membersBySector: Map<string, SectorMemberRecord[]>;
  users: UserOption[];
  canManage: boolean;
}) {
  if (sectors.length === 0) {
    return (
      <EmptyState
        title="Nenhum setor ainda"
        description={
          canManage
            ? "Crie o primeiro setor (comercial, financeiro, marketing…) para começar."
            : "Você ainda não é responsável por nenhum setor. Peça a um administrador para atribuir você."
        }
        action={canManage ? <CreateSectorDialog /> : undefined}
      />
    );
  }

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <CreateSectorDialog />
        </div>
      )}
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {sectors.map((sector) => {
          const archived = sector.archivedAt !== null;
          return (
            <li key={sector.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
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
                  members={(membersBySector.get(sector.id) ?? []).map((member) => ({
                    userId: member.userId,
                    role: member.role,
                  }))}
                  canManageAdmins={canManage}
                />
                <SectorGroupsDialog
                  sectorId={sector.id}
                  sectorName={sector.name}
                  groups={groupsBySector.get(sector.id) ?? []}
                />
                {canManage && <ArchiveSectorButton sectorId={sector.id} archived={archived} />}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
