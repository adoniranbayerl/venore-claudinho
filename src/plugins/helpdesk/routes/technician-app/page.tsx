import { notFound, redirect } from "next/navigation";
import { getCurrentUser, listUsers } from "@/contexts/auth";
import { authorizeActor } from "@/contexts/rbac";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
import { getTicket, listTickets, type TicketDetail } from "@/plugins/helpdesk";
import { AdminTabs } from "../admin/admin-tabs";
import { NotificationBell } from "../../components/tech/notification-bell";
import { NotificationPanel } from "../../components/admin/notification-panel";
import { TaskDetail } from "../../components/tech/task-detail";
import { TaskList } from "../../components/tech/task-list";

// App do técnico (§4, superfície 4) — dentro do (platform) (o técnico é logado), mas tela enxuta e
// mobile-first: "Minhas" / "Fila" / "Notificações", com o detalhe do chamado (timeline + ações)
// na mesma tela. Casca de apresentação: reusa a MESMA camada features/ do admin, sem lógica nova.
export const dynamic = "force-dynamic";

const TABS = [
  { key: "minhas", label: "Minhas" },
  { key: "fila", label: "Fila" },
  { key: "notificacoes", label: "Notificações" },
];

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function nameMap(users: { id: string; name: string | null; email: string }[]): Record<string, string> {
  return Object.fromEntries(users.map((user) => [user.id, user.name?.trim() || user.email]));
}

export default async function TechnicianAppPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!(await isPluginActive("helpdesk"))) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    redirect("/api/auth/signin");
  }

  const actor = await authorizeActor(["helpdesk.manage", "helpdesk.work"]);
  if (!actor.authorized) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-lg font-semibold text-foreground">Sem acesso</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          O app do técnico é para quem atende chamados. Fale com um administrador de Chamados se precisar de acesso.
        </p>
      </div>
    );
  }

  const params = await searchParams;
  const activeTab = TABS.some((tab) => tab.key === first(params.tab)) ? first(params.tab)! : TABS[0].key;
  const openTicketId = first(params.ticket) ?? null;

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-3">
      {/* React iça <link rel="manifest"> pro <head> — deixa /chamados/tecnico instalável como app
          (§4). O service worker para push real com a aba fechada é Fase 8. */}
      <link rel="manifest" href="/helpdesk/manifest.webmanifest" />

      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Chamados</h1>
          <p className="text-xs text-muted-foreground">App do técnico</p>
        </div>
        <NotificationBell />
      </header>

      <AdminTabs tabs={TABS} active={activeTab} />

      {activeTab === "notificacoes" ? (
        <NotificationPanel ticketHrefBase="/chamados/tecnico?tab=minhas&ticket=" />
      ) : (
        <TechnicianTab tab={activeTab} openTicketId={openTicketId} currentUserId={currentUser.data.id} />
      )}
    </div>
  );
}

async function TechnicianTab({
  tab,
  openTicketId,
  currentUserId,
}: {
  tab: string;
  openTicketId: string | null;
  currentUserId: string;
}) {
  const [ticketsResult, usersResult] = await Promise.all([
    listTickets(tab === "minhas" ? { assignedToMe: true } : { onlyActive: true }),
    listUsers(),
  ]);

  if (!ticketsResult.success) {
    return <p className="text-sm text-destructive">{ticketsResult.error.message}</p>;
  }

  const users = usersResult.success
    ? usersResult.data.map((user) => ({ id: user.id, name: user.name, email: user.email }))
    : [];
  const names = nameMap(users);

  if (openTicketId) {
    const detailResult = await getTicket({ ticketId: openTicketId });
    if (!detailResult.success) {
      return <p className="text-sm text-destructive">{detailResult.error.message}</p>;
    }
    const detail: TicketDetail = detailResult.data;
    return <TaskDetail detail={detail} tab={tab} currentUserId={currentUserId} authorNames={names} />;
  }

  return (
    <TaskList
      tickets={ticketsResult.data}
      tab={tab}
      userNames={names}
      emptyLabel={tab === "minhas" ? "Nenhum chamado atribuído a você" : "Nenhum chamado aberto na sua fila"}
    />
  );
}
