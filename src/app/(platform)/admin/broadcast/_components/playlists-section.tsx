"use client";

import { useActionState, type ReactNode } from "react";
import { Clapperboard, Eye, EyeOff, Globe, type LucideIcon, Newspaper, RefreshCw, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaPickerField } from "@/components/media-picker-field";
import { useActionToast } from "@/hooks/use-action-toast";
// Importa direto de contracts/ e shared/, nunca do barrel (@/plugins/broadcast) — mesmo racional
// de scenes-section.tsx/layer-renderer.tsx: este é um "use client" component, e o barrel arrasta
// handlers server-only pro bundle do browser.
import { streamableContentTypeForExtension } from "@/plugins/broadcast/shared/video-extensions";
import type { BroadcastPlaylistItemRecord, BroadcastPlaylistRecord } from "@/plugins/broadcast/contracts/types";
import {
  addMediaAssetPlaylistItemAction,
  addNewsPlaylistItemAction,
  addWebpagePlaylistItemAction,
  createPlaylistAction,
  deletePlaylistItemAction,
  scanPlaylistFolderAction,
  togglePlaylistItemVisibilityAction,
  type BroadcastActionState,
} from "../actions";

const initialState: BroadcastActionState = { error: null };

function CreatePlaylistForm() {
  const [state, formAction, pending] = useActionState(createPlaylistAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Playlist criada." });

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2 rounded-panel border border-border bg-card p-3">
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor="playlist-name">Nome</label>
        <Input id="playlist-name" name="name" placeholder="Comerciais" required className="w-56" />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor="playlist-folder">
          Pasta de vídeos (relativa à raiz configurada, opcional)
        </label>
        <Input id="playlist-folder" name="folderPath" placeholder="clips/comerciais" className="w-64" />
      </div>
      <Button type="submit" disabled={pending}>Nova playlist</Button>
    </form>
  );
}

function ScanPlaylistButton({ playlistId }: { playlistId: string }) {
  const [state, formAction, pending] = useActionState(scanPlaylistFolderAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Pasta reescaneada." });

  return (
    <form action={formAction}>
      <input type="hidden" name="playlistId" value={playlistId} />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        <RefreshCw className="size-4" />
        Reescanear pasta
      </Button>
    </form>
  );
}

function DeletePlaylistItemButton({ itemId }: { itemId: string }) {
  const [state, formAction, pending] = useActionState(deletePlaylistItemAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Item removido." });

  return (
    <form action={formAction}>
      <input type="hidden" name="itemId" value={itemId} />
      <Button type="submit" variant="outline" size="icon" disabled={pending} aria-label="Remover item">
        <Trash2 className="size-4" />
      </Button>
    </form>
  );
}

function ToggleItemVisibilityButton({ item }: { item: BroadcastPlaylistItemRecord }) {
  const [state, formAction, pending] = useActionState(togglePlaylistItemVisibilityAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: item.hidden ? "Item exibido de novo." : "Item escondido." });

  return (
    <form action={formAction}>
      <input type="hidden" name="itemId" value={item.id} />
      <input type="hidden" name="hidden" value={item.hidden ? "false" : "true"} />
      <Button
        type="submit"
        variant="outline"
        size="icon"
        disabled={pending}
        aria-label={item.hidden ? "Mostrar item" : "Esconder item"}
      >
        {item.hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
    </form>
  );
}

function AddMediaAssetItemForm({ playlistId }: { playlistId: string }) {
  const [state, formAction, pending] = useActionState(addMediaAssetPlaylistItemAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Item adicionado." });

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="playlistId" value={playlistId} />
      <MediaPickerField name="mediaAssetId" label="Vídeo ou imagem da biblioteca" />
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor={`${playlistId}-media-title`}>Título (opcional)</label>
        <Input id={`${playlistId}-media-title`} name="title" className="w-40" />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor={`${playlistId}-media-duration`}>Segundos (só p/ imagem)</label>
        <Input id={`${playlistId}-media-duration`} name="durationSeconds" type="number" placeholder="15" className="w-24" />
      </div>
      <Button type="submit" variant="outline" size="sm" disabled={pending}>Adicionar</Button>
    </form>
  );
}

function AddWebpageItemForm({ playlistId }: { playlistId: string }) {
  const [state, formAction, pending] = useActionState(addWebpagePlaylistItemAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Página adicionada." });

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="playlistId" value={playlistId} />
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor={`${playlistId}-webpage-url`}>Site ou rota interna</label>
        <Input id={`${playlistId}-webpage-url`} name="url" placeholder="https://... ou /cursos" required className="w-56" />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor={`${playlistId}-webpage-title`}>Título (opcional)</label>
        <Input id={`${playlistId}-webpage-title`} name="title" className="w-40" />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor={`${playlistId}-webpage-duration`}>Segundos (padrão 60)</label>
        <Input id={`${playlistId}-webpage-duration`} name="durationSeconds" type="number" placeholder="60" className="w-24" />
      </div>
      <Button type="submit" variant="outline" size="sm" disabled={pending}>Adicionar</Button>
    </form>
  );
}

function AddNewsItemForm({ playlistId }: { playlistId: string }) {
  const [state, formAction, pending] = useActionState(addNewsPlaylistItemAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Bloco de notícias adicionado." });

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="playlistId" value={playlistId} />
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor={`${playlistId}-news-title`}>Título (opcional)</label>
        <Input id={`${playlistId}-news-title`} name="title" placeholder="Notícias" className="w-40" />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor={`${playlistId}-news-duration`}>Segundos do bloco (padrão 30)</label>
        <Input id={`${playlistId}-news-duration`} name="durationSeconds" type="number" placeholder="30" className="w-24" />
      </div>
      <Button type="submit" variant="outline" size="sm" disabled={pending}>Adicionar</Button>
    </form>
  );
}

// Item card do "adicionar à playlist" — ícone + rótulo + explicação curta acima do form, pra cada
// tipo de conteúdo ficar visualmente separado (pedido: UI premium, um botão dedicado por tipo,
// scan de pasta só aparece na seção de vídeo).
function AddItemCard({ icon: Icon, label, hint, children }: { icon: LucideIcon; label: string; hint: string; children: ReactNode }) {
  return (
    <div className="space-y-2 rounded-panel border border-border/60 bg-muted/20 p-3">
      <div className="flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/14 text-foreground">
          <Icon className="size-3.5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="truncate text-[11px] text-muted-foreground">{hint}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function extensionOf(relativePath: string): string {
  const dot = relativePath.lastIndexOf(".");
  return dot === -1 ? "" : relativePath.slice(dot);
}

// Ícone por tipo de item — "local" resolve vídeo/imagem pela extensão (mesma allowlist do
// streaming); "media-asset" fica com um ícone genérico de imagem, já que o registro da playlist
// não carrega o contentType do asset (evitaria uma consulta extra só pra decidir um ícone).
// Retorna o elemento já renderizado (não o componente) — react-hooks/static-components não aceita
// <Icon /> com uma referência de componente calculada em runtime dentro do render.
function renderItemIcon(item: BroadcastPlaylistItemRecord): ReactNode {
  const className = "size-4";
  if (item.sourceType === "webpage") return <Globe className={className} aria-hidden="true" />;
  if (item.sourceType === "news") return <Newspaper className={className} aria-hidden="true" />;
  if (item.sourceType === "local" && item.relativePath) {
    const contentType = streamableContentTypeForExtension(extensionOf(item.relativePath));
    if (contentType?.startsWith("video/")) return <Clapperboard className={className} aria-hidden="true" />;
  }
  return <ImageIcon className={className} aria-hidden="true" />;
}

function PlaylistItemRow({ item }: { item: BroadcastPlaylistItemRecord }) {
  const label = item.title ?? item.relativePath ?? item.url ?? (item.sourceType === "news" ? "Bloco de notícias" : "Item da biblioteca de mídia (sem título)");
  const sourceLabel =
    item.sourceType === "local"
      ? "pasta do servidor"
      : item.sourceType === "webpage"
        ? "página web"
        : item.sourceType === "news"
          ? "notícias da região (rotativo)"
          : "biblioteca de mídia";

  return (
    <div className="flex items-center justify-between gap-3 rounded-panel border border-border bg-card p-2.5 text-sm">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/14 text-foreground">
          {renderItemIcon(item)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{label}</p>
          <p className="truncate text-xs text-muted-foreground">
            {sourceLabel}
            {item.durationSeconds != null && ` · ${item.durationSeconds}s`}
            {item.hidden && " · escondido"}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <ToggleItemVisibilityButton item={item} />
        <DeletePlaylistItemButton itemId={item.id} />
      </div>
    </div>
  );
}

export function PlaylistsSection({
  playlists,
  itemsByPlaylist,
}: {
  playlists: BroadcastPlaylistRecord[];
  itemsByPlaylist: Record<string, BroadcastPlaylistItemRecord[]>;
}) {
  return (
    <div className="space-y-4">
      <CreatePlaylistForm />
      {playlists.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma playlist cadastrada ainda.</p>}
      <div className="space-y-3">
        {playlists.map((playlist) => {
          const items = itemsByPlaylist[playlist.id] ?? [];
          return (
            <details key={playlist.id} className="rounded-panel border border-border bg-card p-3" open>
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  {playlist.name}
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                    {items.length} {items.length === 1 ? "item" : "itens"}
                  </span>
                </span>
              </summary>
              <div className="mt-3 space-y-3">
                <div className="space-y-2">
                  {items.map((item) => (
                    <PlaylistItemRow key={item.id} item={item} />
                  ))}
                  {items.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      {playlist.folderPath ? 'Nenhum vídeo encontrado ainda — clique em "Reescanear pasta".' : "Nenhum item ainda."}
                    </p>
                  )}
                </div>

                <div className="space-y-2 border-t border-border/60 pt-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Adicionar à playlist</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {playlist.folderPath && (
                      <AddItemCard icon={Clapperboard} label="Vídeos da pasta" hint={`Pasta: ${playlist.folderPath}`}>
                        <ScanPlaylistButton playlistId={playlist.id} />
                      </AddItemCard>
                    )}
                    <AddItemCard icon={ImageIcon} label="Mídia avulsa" hint="Vídeo ou imagem da biblioteca">
                      <AddMediaAssetItemForm playlistId={playlist.id} />
                    </AddItemCard>
                    <AddItemCard icon={Globe} label="Página web" hint="Site externo ou rota interna">
                      <AddWebpageItemForm playlistId={playlist.id} />
                    </AddItemCard>
                    <AddItemCard icon={Newspaper} label="Bloco de notícias" hint="Manchetes da região configurada">
                      <AddNewsItemForm playlistId={playlist.id} />
                    </AddItemCard>
                  </div>
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
