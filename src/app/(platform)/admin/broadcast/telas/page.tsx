import { getBroadcastOutputsPageData } from "@/platform/admin-shell/get-broadcast-outputs-page-data";
import { listOutputs, listPlaylists } from "@/plugins/broadcast";
import { resolveOutputPlaylistIds } from "../_lib/resolve-output-playlist-ids";
import { OutputsSection } from "../_components/outputs-section";

// Rota enxuta pro papel "editor de tela" (permission broadcast.outputs.manage, sem
// broadcast.manage) — pedido explícito: "a mesma coisa para telas" (mesmo mecanismo do editor de
// agenda). listOutputs() já devolve só as telas atribuídas a este ator quando ele não tem
// broadcast.manage (ver list-outputs/handler.ts) — nada de filtro extra aqui.
// canManageAll=false esconde aviso rápido, criar/apagar tela e a atribuição de responsáveis.
export default async function BroadcastOutputsEditorPage() {
  const gate = await getBroadcastOutputsPageData();
  if (!gate.granted) {
    return (
      <div className="rounded-panel border border-border bg-card p-8 text-center">
        <h1 className="text-lg font-semibold text-foreground">Acesso negado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Você não tem permissão para editar telas do Broadcast Studio.</p>
      </div>
    );
  }

  const [outputsResult, playlistsResult] = await Promise.all([listOutputs(), listPlaylists()]);
  const outputs = outputsResult.success ? outputsResult.data : [];
  const playlists = playlistsResult.success ? playlistsResult.data : [];

  const outputPlaylistById = await resolveOutputPlaylistIds(outputs);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Telas (Broadcast Studio)</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          As telas de TV atribuídas a você — escolha a playlist que cada uma toca e se a agenda/rodapé aparecem.
        </p>
      </div>
      <OutputsSection outputs={outputs} playlists={playlists} outputPlaylistById={outputPlaylistById} canManageAll={false} />
    </div>
  );
}
