import { CalendarDays, ListVideo, Settings as SettingsIcon, Tv } from "lucide-react";
import { listUsers } from "@/contexts/auth";
import { getBroadcastPageData } from "@/platform/admin-shell/get-broadcast-page-data";
import {
  listAgendaEditors,
  listAgendaEvents,
  listAgendaOutputs,
  listAgendas,
  listOutputEditors,
  listOutputs,
  listPlaylistItems,
  listPlaylists,
} from "@/plugins/broadcast";
import type { BroadcastAgendaEventRecord, BroadcastOutputRecord, BroadcastPlaylistRecord } from "@/plugins/broadcast/contracts/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBroadcastBrandColor, getBroadcastNewsExcludeKeywords, getBroadcastRegion } from "./actions";
import { resolvePickableMediaById } from "./_lib/resolve-pickable-media";
import { resolveOutputPlaylistIds } from "./_lib/resolve-output-playlist-ids";
import { PlaylistsSection } from "./_components/playlists-section";
import { OutputsSection } from "./_components/outputs-section";
import { SettingsSection } from "./_components/settings-section";
import { AgendaSection } from "./_components/agenda-section";

// Único ponto de entrada do plugin no admin (pedido explícito: "não separe os links na navegação
// admin") — chegou a existir uma rota satélite por permission (/admin/broadcast/agenda,
// /admin/broadcast/telas, cada uma com seu próprio link), absorvidas aqui: a página decide sozinha
// o quanto mostrar a partir de gate.actor.permissions. broadcast.manage vê tudo (4 abas); quem só
// tem broadcast.agenda.manage/broadcast.outputs.manage (responsável atribuído, ver
// shared/scoped-authorization) vê só a(s) seção(ões) correspondente(s), sem aba nenhuma quando é
// só uma — uma Tabs de item único é ruído, não navegação.
export default async function BroadcastAdminPage() {
  const gate = await getBroadcastPageData();
  if (!gate.granted) {
    return (
      <div className="rounded-panel border border-border bg-card p-8 text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para ver o Broadcast Studio.</p>
      </div>
    );
  }

  const hasFullAccess = gate.actor.isSuperadmin || gate.actor.permissions.includes("broadcast.manage");
  const hasAgendaAccess = hasFullAccess || gate.actor.permissions.includes("broadcast.agenda.manage");
  const hasOutputsAccess = hasFullAccess || gate.actor.permissions.includes("broadcast.outputs.manage");

  const [playlistsResult, outputsResult, agendasResult, agendaEventsResult] = await Promise.all([
    hasFullAccess ? listPlaylists() : Promise.resolve(null),
    hasOutputsAccess ? listOutputs() : Promise.resolve(null),
    hasAgendaAccess ? listAgendas() : Promise.resolve(null),
    hasAgendaAccess ? listAgendaEvents() : Promise.resolve(null),
  ]);

  const playlists: BroadcastPlaylistRecord[] = playlistsResult?.success ? playlistsResult.data : [];
  const outputs: BroadcastOutputRecord[] = outputsResult?.success ? outputsResult.data : [];
  const agendas = agendasResult?.success ? agendasResult.data : [];
  const agendaEvents: BroadcastAgendaEventRecord[] = agendaEventsResult?.success ? agendaEventsResult.data : [];

  const eventsByAgenda: Record<string, typeof agendaEvents> = {};
  for (const event of agendaEvents) {
    (eventsByAgenda[event.agendaId] ??= []).push(event);
  }

  // Pré-carrega a mídia já selecionada de cada agenda/evento (filename/url/contentType) pro
  // MediaPickerField dos formulários de edição nascer preenchido — sem isso, editar qualquer outro
  // campo limparia a logo/capa por engano (o campo hidden do picker some quando "sem seleção").
  const [agendaLogoMediaById, eventCoverMediaById] = await Promise.all([
    resolvePickableMediaById(agendas, (agenda) => agenda.logoMediaAssetId),
    resolvePickableMediaById(agendaEvents, (event) => event.coverMediaAssetId),
  ]);

  const outputPlaylistById = hasOutputsAccess ? await resolveOutputPlaylistIds(outputs) : {};

  // Vínculo agenda↔saída, atribuição de responsáveis e a lista de usuários só importam pra quem
  // administra tudo — canManageAll=false esconde as UIs correspondentes (ver AgendaSection/
  // OutputsSection), então nem vale a pena buscar esses dados pra um ator restrito.
  const [agendaOutputsResult, agendaEditorsResult, outputEditorsResult, usersResult, region, brandColor, newsExcludeKeywords] =
    await Promise.all([
      hasFullAccess ? listAgendaOutputs() : Promise.resolve(null),
      hasFullAccess ? listAgendaEditors() : Promise.resolve(null),
      hasFullAccess ? listOutputEditors() : Promise.resolve(null),
      hasFullAccess ? listUsers() : Promise.resolve(null),
      hasFullAccess ? getBroadcastRegion() : Promise.resolve(""),
      hasFullAccess ? getBroadcastBrandColor() : Promise.resolve(""),
      hasFullAccess ? getBroadcastNewsExcludeKeywords() : Promise.resolve(""),
    ]);

  const agendaOutputIdsByAgendaId = agendaOutputsResult?.success ? agendaOutputsResult.data : {};
  const agendaEditorUserIdsByAgendaId = agendaEditorsResult?.success ? agendaEditorsResult.data : {};
  const outputEditorUserIdsByOutputId = outputEditorsResult?.success ? outputEditorsResult.data : {};
  const allUsers = usersResult?.success ? usersResult.data : [];

  const itemsByPlaylist = Object.fromEntries(
    await Promise.all(
      playlists.map(async (playlist) => {
        const result = await listPlaylistItems({ playlistId: playlist.id });
        return [playlist.id, result.success ? result.data : []] as const;
      }),
    ),
  );

  const outputsView = (
    <OutputsSection
      outputs={outputs}
      playlists={playlists}
      outputPlaylistById={outputPlaylistById}
      canManageAll={hasFullAccess}
      allUsers={allUsers}
      outputEditorUserIdsByOutputId={outputEditorUserIdsByOutputId}
    />
  );
  const agendaView = (
    <AgendaSection
      agendas={agendas}
      eventsByAgenda={eventsByAgenda}
      agendaLogoMediaById={agendaLogoMediaById}
      eventCoverMediaById={eventCoverMediaById}
      outputs={outputs}
      agendaOutputIdsByAgendaId={agendaOutputIdsByAgendaId}
      canManageAll={hasFullAccess}
      allUsers={allUsers}
      agendaEditorUserIdsByAgendaId={agendaEditorUserIdsByAgendaId}
    />
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Broadcast Studio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {hasFullAccess
            ? "Monte playlists de vídeo/imagem/site/notícias, gerencie a agenda e gere a URL que abre na TV — o layout da tela é fixo e cuidado automaticamente."
            : "As telas e/ou agendas atribuídas a você."}
        </p>
      </div>

      {hasFullAccess ? (
        <Tabs defaultValue="outputs">
          <div className="overflow-x-auto">
            <TabsList className="w-fit">
              <TabsTrigger value="outputs" className="shrink-0">
                <Tv aria-hidden="true" /> Telas
              </TabsTrigger>
              <TabsTrigger value="playlists" className="shrink-0">
                <ListVideo aria-hidden="true" /> Playlists
              </TabsTrigger>
              <TabsTrigger value="agenda" className="shrink-0">
                <CalendarDays aria-hidden="true" /> Agenda
              </TabsTrigger>
              <TabsTrigger value="settings" className="shrink-0">
                <SettingsIcon aria-hidden="true" /> Configurações
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="outputs" className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Uma tela é uma URL — abra ela no navegador da TV. Escolha a playlist que ela toca e se a agenda/rodapé aparecem.
            </p>
            {outputsView}
          </TabsContent>

          <TabsContent value="playlists" className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Uma playlist é a lista de vídeos, imagens, páginas web e notícias que uma tela reproduz em sequência.
            </p>
            <PlaylistsSection playlists={playlists} itemsByPlaylist={itemsByPlaylist} />
          </TabsContent>

          <TabsContent value="agenda" className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Eventos mostrados na coluna de agenda — só os que ainda vão acontecer aparecem na TV.
            </p>
            {agendaView}
          </TabsContent>

          <TabsContent value="settings">
            <SettingsSection region={region} brandColor={brandColor} newsExcludeKeywords={newsExcludeKeywords} />
          </TabsContent>
        </Tabs>
      ) : hasOutputsAccess && hasAgendaAccess ? (
        // Responsável por telas E agendas, mas sem broadcast.manage — duas abas, sem Playlists/
        // Configurações (isso continua exclusivo de quem administra tudo).
        <Tabs defaultValue="outputs">
          <TabsList className="w-fit">
            <TabsTrigger value="outputs">
              <Tv aria-hidden="true" /> Telas
            </TabsTrigger>
            <TabsTrigger value="agenda">
              <CalendarDays aria-hidden="true" /> Agenda
            </TabsTrigger>
          </TabsList>
          <TabsContent value="outputs" className="space-y-3">{outputsView}</TabsContent>
          <TabsContent value="agenda" className="space-y-3">{agendaView}</TabsContent>
        </Tabs>
      ) : hasOutputsAccess ? (
        outputsView
      ) : (
        agendaView
      )}
    </div>
  );
}
