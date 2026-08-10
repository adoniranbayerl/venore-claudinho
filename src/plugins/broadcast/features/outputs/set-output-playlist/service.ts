import { beginOperation, endOperation } from "@/observability";
import { applyVideoLayerPlaylist, findOutputById, findVideoLayerBySceneId } from "./store";
import type { SetOutputPlaylistCommand, SetOutputPlaylistResult } from "./types";

export async function setOutputPlaylist(command: SetOutputPlaylistCommand): Promise<SetOutputPlaylistResult> {
  const output = await findOutputById(command.outputId);
  if (!output) {
    return { success: false, error: { code: "broadcast.set-output-playlist.not_found", message: "Saída não encontrada." } };
  }
  if (!output.currentSceneId) {
    return {
      success: false,
      error: { code: "broadcast.set-output-playlist.no_scene", message: "Esta saída não tem uma cena — exclua e crie de novo." },
    };
  }

  const videoLayer = await findVideoLayerBySceneId(output.currentSceneId);
  if (!videoLayer) {
    return {
      success: false,
      error: { code: "broadcast.set-output-playlist.no_video_layer", message: "Esta saída não tem uma camada de vídeo." },
    };
  }

  const handle = beginOperation({
    useCase: "broadcast.set-output-playlist",
    actor: { id: command.actorId, type: "user" },
    kind: "write",
  });

  await applyVideoLayerPlaylist(videoLayer.id, videoLayer.config, command.playlistId);

  endOperation(handle, { success: true });
  return { success: true, data: output };
}
