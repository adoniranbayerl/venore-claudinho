import type { CreatePlaylistInput } from "./types";

// folderPath aqui é só uma checagem de forma (sintaxe) — não confirma que a pasta existe no
// filesystem (o scan, Fase 2, é quem toca disco) nem resolve contra a raiz configurada (isso é
// scan-playlist-folder/service.ts, via shared/sandboxed-path.ts). Rejeitar ".." e caminho
// absoluto aqui é só a primeira camada, não a única.
export function validateCreatePlaylistInput(input: CreatePlaylistInput): { code: string; message: string } | null {
  if (!input.name || !input.name.trim()) {
    return { code: "broadcast.create-playlist.invalid_name", message: "Informe um nome para a playlist." };
  }

  if (input.folderPath !== undefined && input.folderPath !== null && input.folderPath.trim() !== "") {
    const trimmed = input.folderPath.trim();
    const looksAbsolute = trimmed.startsWith("/") || trimmed.startsWith("\\") || /^[a-zA-Z]:/.test(trimmed);
    const hasParentSegment = trimmed.split(/[\\/]/).includes("..");
    if (looksAbsolute || hasParentSegment) {
      return {
        code: "broadcast.create-playlist.invalid_folder_path",
        message: 'A pasta precisa ser um caminho relativo à raiz configurada, sem ".." nem caminho absoluto.',
      };
    }
  }

  return null;
}
