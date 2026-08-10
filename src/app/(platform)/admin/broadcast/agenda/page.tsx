import { getBroadcastAgendaPageData } from "@/platform/admin-shell/get-broadcast-agenda-page-data";
import { listAgendaEvents, listAgendas } from "@/plugins/broadcast";
import { resolvePickableMediaById } from "../_lib/resolve-pickable-media";
import { AgendaSection } from "../_components/agenda-section";

// Rota enxuta pro papel "editor de agenda" (permission broadcast.agenda.manage, sem
// broadcast.manage) — pedido explícito: "precisamos criar um editor de Agenda, que editores
// possam atualizar". Só a seção de agenda, sem playlists/saídas/configurações. Não busca
// listAgendaOutputs nem passa outputs de verdade — o vínculo agenda↔saída (setAgendaOutputsAction)
// é gateado só por broadcast.manage (decisão de quem administra as telas, não do editor de
// conteúdo), então AgendaSection recebe outputs=[] aqui e a UI de vínculo simplesmente não
// aparece (ver o guard outputs.length===0 em AgendaOutputsForm).
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
      />
    </div>
  );
}
