import { listUsers } from "@/contexts/auth";
import { AdminAccessDenied } from "@/components/admin-access-denied";
import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";
import { getHelpdeskPageData } from "@/platform/admin-shell/get-helpdesk-page-data";
import {
  getMyHelpdeskAccess,
  getTicket,
  listBoards,
  listCategories,
  listKiosks,
  listQueueMembers,
  listQueues,
  listSlaPolicies,
  listTickets,
  type HelpdeskAccess,
  type QueueListItem,
  type SlaPolicyRow,
  type TicketDetail,
} from "@/plugins/helpdesk";
import type { CategoryRecord, QueueMemberRecord } from "@/plugins/helpdesk/contracts/types";
import { AdminTabs } from "./admin-tabs";
import { BoardsView } from "./boards-view";
import { CategoriesView } from "./categories-view";
import { KiosksView } from "./kiosks-view";
import { QueuesView } from "./queues-view";
import { TicketTable } from "../../components/admin/ticket-table";
import { TicketDrawer } from "../../components/admin/ticket-drawer";
import { NotificationPanel } from "../../components/admin/notification-panel";

const EMPTY_ACCESS: HelpdeskAccess = {
  canManageAll: false,
  canReadAll: false,
  managerQueueIds: [],
  memberQueueIds: [],
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function nameMap(users: { id: string; name: string | null; email: string }[]): Record<string, string> {
  return Object.fromEntries(users.map((user) => [user.id, user.name?.trim() || user.email]));
}

export default async function HelpdeskAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const gate = await getHelpdeskPageData();
  if (!gate.granted) {
    return <AdminAccessDenied message="Você não tem permissão para ver Chamados." />;
  }

  const params = await searchParams;
  const [accessResult, queuesResult] = await Promise.all([
    getMyHelpdeskAccess(),
    listQueues({ includeArchived: true }),
  ]);

  const access = accessResult.success ? accessResult.data : EMPTY_ACCESS;
  const queues = queuesResult.success ? queuesResult.data : [];
  const canManage = access.canManageAll;
  const canConfigureCategories = canManage || access.managerQueueIds.length > 0;

  const tabs: { key: string; label: string }[] = [
    { key: "fila", label: "Fila" },
    { key: "meus-chamados", label: "Meus chamados" },
    { key: "notificacoes", label: "Notificações" },
    { key: "filas", label: "Filas & SLA" },
  ];
  if (canConfigureCategories) tabs.push({ key: "categorias", label: "Categorias" });
  if (canManage) tabs.push({ key: "quiosques", label: "Quiosques" });
  if (canManage) tabs.push({ key: "paineis", label: "Painéis" });

  const activeTab = tabs.some((tab) => tab.key === first(params.tab)) ? first(params.tab)! : tabs[0].key;
  const openTicketId = first(params.ticket) ?? null;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Chamados"
        description="Fila de atendimento das equipes internas. SLA, quiosque e painéis entram nas próximas etapas."
      />

      <AdminTabs tabs={tabs} active={activeTab} />
      {activeTab === "fila" && (
        <FilaTab tab="fila" openTicketId={openTicketId} assignedToMe={false} currentUserId={gate.actor.id} />
      )}
      {activeTab === "meus-chamados" && (
        <FilaTab tab="meus-chamados" openTicketId={openTicketId} assignedToMe currentUserId={gate.actor.id} />
      )}
      {activeTab === "notificacoes" && <NotificationPanel />}
      {activeTab === "filas" && <FilasTab queues={queues} canManage={canManage} />}
      {activeTab === "categorias" && (
        <CategoriasTab
          queues={queues.filter((queue) => queue.archivedAt === null)}
          canManage={canManage}
          managerQueueIds={access.managerQueueIds}
        />
      )}
      {activeTab === "quiosques" && <QuiosquesTab />}
      {activeTab === "paineis" && <PaineisTab />}
    </div>
  );
}

async function QuiosquesTab() {
  const result = await listKiosks();
  if (!result.success) {
    return <p className="text-sm text-destructive">{result.error.message}</p>;
  }
  return <KiosksView kiosks={result.data.kiosks} queueOptions={result.data.queueOptions} />;
}

async function PaineisTab() {
  const result = await listBoards();
  if (!result.success) {
    return <p className="text-sm text-destructive">{result.error.message}</p>;
  }
  return <BoardsView boards={result.data.boards} queueOptions={result.data.queueOptions} />;
}

async function FilaTab({
  tab,
  openTicketId,
  assignedToMe,
  currentUserId,
}: {
  tab: string;
  openTicketId: string | null;
  assignedToMe: boolean;
  currentUserId: string;
}) {
  const [ticketsResult, usersResult] = await Promise.all([
    listTickets(assignedToMe ? { assignedToMe: true } : { onlyActive: true }),
    listUsers(),
  ]);

  if (!ticketsResult.success) {
    return <p className="text-sm text-destructive">{ticketsResult.error.message}</p>;
  }

  const users = usersResult.success
    ? usersResult.data.map((user) => ({ id: user.id, name: user.name, email: user.email }))
    : [];
  const names = nameMap(users);

  let detail: TicketDetail | null = null;
  let assignableUsers: { id: string; name: string }[] = [];
  if (openTicketId) {
    const detailResult = await getTicket({ ticketId: openTicketId });
    if (detailResult.success) {
      detail = detailResult.data;
      const membersResult = await listQueueMembers(detail.queue.id);
      const memberIds = membersResult.success ? membersResult.data.map((member) => member.userId) : [];
      assignableUsers = memberIds.map((id) => ({ id, name: names[id] ?? id }));
    }
  }

  return (
    <div className="space-y-4">
      <TicketTable
        tickets={ticketsResult.data}
        tab={tab}
        userNames={names}
        emptyLabel={assignedToMe ? "Nenhum chamado atribuído a você" : "Nenhum chamado aberto"}
      />
      <TicketDrawer
        open={Boolean(openTicketId && detail)}
        tab={tab}
        detail={detail}
        assignableUsers={assignableUsers}
        authorNames={names}
        currentUserId={currentUserId}
      />
    </div>
  );
}

async function FilasTab({ queues, canManage }: { queues: QueueListItem[]; canManage: boolean }) {
  const [usersResult, membersResults, slaResults] = await Promise.all([
    listUsers(),
    Promise.all(queues.map((queue) => listQueueMembers(queue.id))),
    Promise.all(queues.map((queue) => listSlaPolicies(queue.id))),
  ]);

  const membersByQueue = new Map<string, QueueMemberRecord[]>();
  const slaByQueue = new Map<string, SlaPolicyRow[]>();
  queues.forEach((queue, index) => {
    const members = membersResults[index];
    membersByQueue.set(queue.id, members?.success ? members.data : []);
    const sla = slaResults[index];
    slaByQueue.set(queue.id, sla?.success ? sla.data.rows : []);
  });

  const users = usersResult.success
    ? usersResult.data.map((user) => ({ id: user.id, name: user.name, email: user.email }))
    : [];

  return (
    <QueuesView
      queues={queues}
      membersByQueue={membersByQueue}
      slaByQueue={slaByQueue}
      users={users}
      canManage={canManage}
    />
  );
}

async function CategoriasTab({
  queues,
  canManage,
  managerQueueIds,
}: {
  queues: { id: string; name: string }[];
  canManage: boolean;
  managerQueueIds: string[];
}) {
  const results = await Promise.all(queues.map((queue) => listCategories({ queueId: queue.id, includeArchived: true })));

  const categoriesByQueue = new Map<string, CategoryRecord[]>();
  queues.forEach((queue, index) => {
    const result = results[index];
    categoriesByQueue.set(queue.id, result?.success ? result.data : []);
  });

  const configurableQueueIds = new Set(canManage ? queues.map((queue) => queue.id) : managerQueueIds);

  if (queues.length === 0) {
    return (
      <EmptyState
        title="Nenhuma fila ativa"
        description="Crie ou reative uma fila na aba Filas antes de cadastrar categorias."
      />
    );
  }

  return (
    <CategoriesView queues={queues} categoriesByQueue={categoriesByQueue} configurableQueueIds={configurableQueueIds} />
  );
}
