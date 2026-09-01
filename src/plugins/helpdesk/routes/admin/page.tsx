import { listUsers } from "@/contexts/auth";
import { AdminAccessDenied } from "@/components/admin-access-denied";
import { AdminPageHeader } from "@/components/admin-page-header";
import { EmptyState } from "@/components/empty-state";
import { getHelpdeskPageData } from "@/platform/admin-shell/get-helpdesk-page-data";
import {
  getMyHelpdeskAccess,
  listCategories,
  listQueueMembers,
  listQueues,
  type HelpdeskAccess,
  type QueueListItem,
} from "@/plugins/helpdesk";
import type { CategoryRecord, QueueMemberRecord } from "@/plugins/helpdesk/contracts/types";
import { AdminTabs } from "./admin-tabs";
import { CategoriesView } from "./categories-view";
import { QueuesView } from "./queues-view";

const EMPTY_ACCESS: HelpdeskAccess = {
  canManageAll: false,
  canReadAll: false,
  managerQueueIds: [],
  memberQueueIds: [],
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
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

  const tabs: { key: string; label: string }[] = [];
  tabs.push({ key: "filas", label: "Filas" });
  if (canConfigureCategories) tabs.push({ key: "categorias", label: "Categorias" });

  const activeTab = tabs.some((tab) => tab.key === first(params.tab)) ? first(params.tab)! : tabs[0].key;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Chamados"
        description="Filas de atendimento das equipes internas, suas equipes e categorias. Chamados, SLA, quiosque e painéis entram nas próximas etapas."
      />

      <AdminTabs tabs={tabs} active={activeTab} />
      {activeTab === "filas" && <FilasTab queues={queues} canManage={canManage} />}
      {activeTab === "categorias" && (
        <CategoriasTab
          queues={queues.filter((queue) => queue.archivedAt === null)}
          canManage={canManage}
          managerQueueIds={access.managerQueueIds}
        />
      )}
    </div>
  );
}

async function FilasTab({ queues, canManage }: { queues: QueueListItem[]; canManage: boolean }) {
  const [usersResult, ...membersResults] = await Promise.all([
    listUsers(),
    ...queues.map((queue) => listQueueMembers(queue.id)),
  ]);

  const membersByQueue = new Map<string, QueueMemberRecord[]>();
  queues.forEach((queue, index) => {
    const result = membersResults[index];
    membersByQueue.set(queue.id, result?.success ? result.data : []);
  });

  const users = usersResult.success
    ? usersResult.data.map((user) => ({ id: user.id, name: user.name, email: user.email }))
    : [];

  return <QueuesView queues={queues} membersByQueue={membersByQueue} users={users} canManage={canManage} />;
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
