import { getBroadcastAgendaPageData } from "@/platform/admin-shell/get-broadcast-agenda-page-data";
import { listAgendaEvents, listAgendas } from "@/plugins/broadcast";
import { resolvePickableMediaById } from "../_lib/resolve-pickable-media";
import { AgendaSection } from "../_components/agenda-section";

// Rota enxuta pro papel "editor de agenda" (permission broadcast.agenda.manage, sem
// broadcast.manage) — pedido explícito: "adicionar um responsável (role editor pra cima) com
// acesso e permissão para alterar apenas a agenda atribuída". Só a seção de agenda, sem
// playlists/saídas/configurações. listAgendas()/listAgendaEvents() já devolvem só o que está
// atribuído a este ator quando ele não tem broadcast.manage (ver list-agendas/handler.ts) — nada
// de filtro extra aqui. canManageAll=false esconde criar/apagar/reordenar agenda, o vínculo
// agenda↔saída e a atribuição de responsáveis, que continuam ação de quem administra tudo.
export default async function BroadcastAgendaEditorPage() {
  const gate = await getBroadcastAgendaPageData();
  if (!gate.granted) {
    return (
      <div className="rounded-panel border border-border bg-card p-8 text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para editar a agenda do Broadcast Studio.</p>
      </div>
    );
  }

  const [agendasResult, agendaEventsResult] = await Promise.all([listAgendas(), listAgendaEvents()]);
  const agendas = agendasResult.success ? agendasResult.data : [];
  const agendaEvents = agendaEventsResult.success ? agendaEventsResult.data : [];

  const eventsByAgenda: Record<string, typeof agendaEvents> = {};
  for (const event of agendaEvents) {
    (eventsByAgenda[event.agendaId] ??= []).push(event);
  }

  const [agendaLogoMediaById, eventCoverMediaById] = await Promise.all([
    resolvePickableMediaById(agendas, (agenda) => agenda.logoMediaAssetId),
    resolvePickableMediaById(agendaEvents, (event) => event.coverMediaAssetId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Agenda (Broadcast Studio)</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Eventos mostrados na coluna de agenda das telas de TV — só os que ainda vão acontecer aparecem.
        </p>
      </div>
      <AgendaSection
        agendas={agendas}
        eventsByAgenda={eventsByAgenda}
        agendaLogoMediaById={agendaLogoMediaById}
        eventCoverMediaById={eventCoverMediaById}
        outputs={[]}
        agendaOutputIdsByAgendaId={{}}
        canManageAll={false}
      />
    </div>
  );
}
