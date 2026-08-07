import { CalendarDays, Clapperboard, ListVideo, Settings as SettingsIcon, Tv } from "lucide-react";
import { getBroadcastPageData } from "@/platform/admin-shell/get-broadcast-page-data";
import { listAgendaEvents, listAgendas, listLayers, listOutputs, listPlaylistItems, listPlaylists, listScenes } from "@/plugins/broadcast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBroadcastRegion, getBroadcastRootFolder } from "./actions";
import { ScenesSection } from "./_components/scenes-section";
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

  const [scenesResult, playlistsResult, outputsResult, agendasResult, agendaEventsResult, rootFolder, region] = await Promise.all([
    listScenes(),
    listPlaylists(),
    listOutputs(),
    listAgendas(),
    listAgendaEvents(),
    getBroadcastRootFolder(),
    getBroadcastRegion(),
  ]);

  const scenes = scenesResult.success ? scenesResult.data : [];
  const playlists = playlistsResult.success ? playlistsResult.data : [];
  const outputs = outputsResult.success ? outputsResult.data : [];
  const agendas = agendasResult.success ? agendasResult.data : [];
  const agendaEvents = agendaEventsResult.success ? agendaEventsResult.data : [];

  const eventsByAgenda: Record<string, typeof agendaEvents> = {};
  for (const event of agendaEvents) {
    (eventsByAgenda[event.agendaId] ??= []).push(event);
  }

  const [layersByScene, itemsByPlaylist] = await Promise.all([
    Promise.all(scenes.map((scene) => listLayers({ sceneId: scene.id }))).then((results) =>
      Object.fromEntries(scenes.map((scene, index) => [scene.id, results[index].success ? results[index].data : []])),
    ),
    Promise.all(playlists.map((playlist) => listPlaylistItems({ playlistId: playlist.id }))).then((results) =>
      Object.fromEntries(playlists.map((playlist, index) => [playlist.id, results[index].success ? results[index].data : []])),
    ),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Broadcast Studio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monte cenas em camadas (vídeo/imagem/site + overlays), controle qual cena está no ar e gere a URL que abre na TV.
        </p>
      </div>

      <Tabs defaultValue="outputs">
        <div className="overflow-x-auto">
          <TabsList className="w-fit">
            <TabsTrigger value="outputs" className="shrink-0">
              <Tv aria-hidden="true" /> Saídas
            </TabsTrigger>
            <TabsTrigger value="scenes" className="shrink-0">
              <Clapperboard aria-hidden="true" /> Cenas &amp; camadas
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
            Uma saída é uma URL — abra ela no navegador da TV. Aqui você troca ao vivo qual cena aparece nela.
          </p>
          <OutputsSection outputs={outputs} scenes={scenes} />
        </TabsContent>

        <TabsContent value="scenes" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Uma cena é o que aparece na TV. Cada cena pode ter várias camadas sobrepostas (vídeo, texto, relógio e clima,
            notícias, agenda...).
          </p>
          <ScenesSection scenes={scenes} layersByScene={layersByScene} playlists={playlists} />
        </TabsContent>

        <TabsContent value="playlists" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Uma playlist é a lista de vídeos, imagens e páginas web que uma camada reproduz em sequência.
          </p>
          <PlaylistsSection playlists={playlists} itemsByPlaylist={itemsByPlaylist} />
        </TabsContent>

        <TabsContent value="agenda" className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Eventos mostrados pela camada &quot;Agenda&quot; — só os que ainda vão acontecer aparecem na TV.
          </p>
          <AgendaSection agendas={agendas} eventsByAgenda={eventsByAgenda} />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsSection rootFolder={rootFolder} region={region} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
