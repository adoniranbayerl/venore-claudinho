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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBroadcastBrandColor, getBroadcastNewsExcludeKeywords, getBroadcastRegion } from "./actions";
import { resolvePickableMediaById } from "./_lib/resolve-pickable-media";
import { resolveOutputPlaylistIds } from "./_lib/resolve-output-playlist-ids";
import { PlaylistsSection } from "./_components/playlists-section";
import { OutputsSection } from "./_components/outputs-section";
import { SettingsSection } from "./_components/settings-section";
import { AgendaSection } from "./_components/agenda-section";

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

  const [
    playlistsResult,
    outputsResult,
    agendasResult,
    agendaEventsResult,
    agendaOutputsResult,
    agendaEditorsResult,
    outputEditorsResult,
    usersResult,
    region,
    brandColor,
    newsExcludeKeywords,
  ] = await Promise.all([
    listPlaylists(),
    listOutputs(),
    listAgendas(),
    listAgendaEvents(),
    listAgendaOutputs(),
    listAgendaEditors(),
    listOutputEditors(),
    listUsers(),
    getBroadcastRegion(),
    getBroadcastBrandColor(),
    getBroadcastNewsExcludeKeywords(),
  ]);

  const playlists = playlistsResult.success ? playlistsResult.data : [];
  const outputs = outputsResult.success ? outputsResult.data : [];
  const agendas = agendasResult.success ? agendasResult.data : [];
  const agendaEvents = agendaEventsResult.success ? agendaEventsResult.data : [];
  const agendaOutputIdsByAgendaId = agendaOutputsResult.success ? agendaOutputsResult.data : {};
  const agendaEditorUserIdsByAgendaId = agendaEditorsResult.success ? agendaEditorsResult.data : {};
  const outputEditorUserIdsByOutputId = outputEditorsResult.success ? outputEditorsResult.data : {};
  // "Responsável" por agenda/tela (ver AgendaEditorsForm/OutputEditorsForm) — todos os usuários
  // cadastrados, mesmo padrão de admin/rbac/page.tsx (allUsers = listUsers() direto, sem filtrar
  // por status).
  const allUsers = usersResult.success ? usersResult.data : [];

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

  const itemsByPlaylist = Object.fromEntries(
    await Promise.all(
      playlists.map(async (playlist) => {
        const result = await listPlaylistItems({ playlistId: playlist.id });
        return [playlist.id, result.success ? result.data : []] as const;
      }),
    ),
  );

  const outputPlaylistById = await resolveOutputPlaylistIds(outputs);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Broadcast Studio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monte playlists de vídeo/imagem/site/notícias, gerencie a agenda e gere a URL que abre na TV — o layout da tela é
          fixo e cuidado automaticamente.
        </p>
      </div>

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
          <OutputsSection
            outputs={outputs}
            playlists={playlists}
            outputPlaylistById={outputPlaylistById}
            allUsers={allUsers}
            outputEditorUserIdsByOutputId={outputEditorUserIdsByOutputId}
          />
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
          <AgendaSection
            agendas={agendas}
            eventsByAgenda={eventsByAgenda}
            agendaLogoMediaById={agendaLogoMediaById}
            eventCoverMediaById={eventCoverMediaById}
            outputs={outputs}
            agendaOutputIdsByAgendaId={agendaOutputIdsByAgendaId}
            allUsers={allUsers}
            agendaEditorUserIdsByAgendaId={agendaEditorUserIdsByAgendaId}
          />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsSection region={region} brandColor={brandColor} newsExcludeKeywords={newsExcludeKeywords} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
