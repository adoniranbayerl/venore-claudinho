import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/contexts/auth";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
import { listMyTickets, listOpenQueues } from "@/plugins/helpdesk";
import { NewTicketForm } from "../../components/portal/new-ticket-form";
import { MyTicketsList } from "../../components/portal/my-tickets-list";

export const dynamic = "force-dynamic";

// Portal do solicitante logado (§1, superfície 1) — lista os próprios chamados e abre novos. Sem
// permission: self-service, só exige sessão.
export default async function HelpdeskPortalPage() {
  if (!(await isPluginActive("helpdesk"))) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    redirect("/api/auth/signin");
  }

  const [ticketsResult, queuesResult] = await Promise.all([listMyTickets(), listOpenQueues()]);
  const tickets = ticketsResult.success ? ticketsResult.data : [];
  const queues = queuesResult.success ? queuesResult.data : [];

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Meus chamados</h1>
          <p className="mt-1 text-sm text-muted-foreground">Acompanhe seus pedidos para as equipes de TI e Manutenção.</p>
        </div>
        {queues.length > 0 && <NewTicketForm queues={queues} />}
      </div>

      {queues.length === 0 && (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Nenhuma fila de atendimento está disponível no momento.
        </p>
      )}

      <MyTicketsList tickets={tickets} />
    </div>
  );
}
