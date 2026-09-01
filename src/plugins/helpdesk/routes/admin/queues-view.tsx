import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import type { QueueMemberRecord } from "@/plugins/helpdesk/contracts/types";
import type { QueueListItem } from "@/plugins/helpdesk";
import { ArchiveQueueButton } from "./archive-queue-button";
import { CreateQueueDialog, EditQueueDialog } from "./queue-dialogs";
import { QueueIcon } from "./queue-icon";
import { QueueMembersDialog } from "./queue-members-dialog";

type UserOption = { id: string; name: string | null; email: string };

export function QueuesView({
  queues,
  membersByQueue,
  users,
  canManage,
}: {
  queues: QueueListItem[];
  membersByQueue: Map<string, QueueMemberRecord[]>;
  users: UserOption[];
  canManage: boolean;
}) {
  if (queues.length === 0) {
    return (
      <EmptyState
        title="Nenhuma fila ainda"
        description={
          canManage
            ? "Crie a primeira fila (TI, Manutenção…) para começar a receber chamados."
            : "Você ainda não é responsável por nenhuma fila. Peça a um administrador para atribuir você."
        }
        action={canManage ? <CreateQueueDialog /> : undefined}
      />
    );
  }

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <CreateQueueDialog />
        </div>
      )}
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {queues.map((queue) => {
          const archived = queue.archivedAt !== null;
          const members = membersByQueue.get(queue.id) ?? [];
          const managerCount = members.filter((member) => member.role === "manager").length;
          return (
            <li key={queue.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/14 text-primary">
                  <QueueIcon icon={queue.icon} className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-foreground">{queue.name}</h2>
                    <Badge variant="outline" className="font-mono text-xs">
                      {queue.key}
                    </Badge>
                    {archived && <Badge variant="outline">Arquivada</Badge>}
                  </div>
                  {queue.description && (
                    <p className="mt-1 text-xs text-muted-foreground">{queue.description}</p>
                  )}
                </div>
              </div>

              <dl className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                <div className="flex gap-1">
                  <dt>Equipe:</dt>
                  <dd className="text-foreground">
                    {members.length} ({managerCount} {managerCount === 1 ? "gestor" : "gestores"})
                  </dd>
                </div>
                <div className="flex gap-1">
                  <dt>Categorias:</dt>
                  <dd className="text-foreground">{queue.categoryCount}</dd>
                </div>
              </dl>

              <div className="flex flex-wrap items-center gap-2">
                <QueueMembersDialog
                  queueId={queue.id}
                  queueName={queue.name}
                  allUsers={users}
                  members={members.map((member) => ({ userId: member.userId, role: member.role }))}
                  canManageManagers={canManage}
                />
                {canManage && <EditQueueDialog queue={queue} />}
                {canManage && <ArchiveQueueButton queueId={queue.id} archived={archived} />}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
