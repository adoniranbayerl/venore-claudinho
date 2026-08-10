import { authorizeActor } from "@/contexts/rbac";
import { listPlaylists } from "./service";
import type { ListPlaylistsResult } from "./types";

// Também aceita broadcast.outputs.manage — um "responsável por tela" precisa ver a lista de
// playlists pra poder trocar qual sua saída atribuída toca (SetOutputPlaylistForm), mesmo sem
// broadcast.manage. Não amplia o que ele pode FAZER com uma playlist (criar/editar/apagar
// continuam só broadcast.manage) — só o que ele pode LER pra montar o seletor.
export async function listPlaylistsHandler(): Promise<ListPlaylistsResult> {
  const authz = await authorizeActor(["broadcast.manage", "broadcast.outputs.manage"]);
  if (!authz.authorized) {
    return { success: false, error: authz.error };
  }

  return listPlaylists();
}
