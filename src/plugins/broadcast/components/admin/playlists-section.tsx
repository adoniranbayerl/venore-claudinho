"use client";

import { useActionState, useState, type ReactNode } from "react";
import {
  Clapperboard,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Globe,
  Newspaper,
  Pencil,
  RefreshCw,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaPickerField } from "@/components/media-picker-field";
import { useActionToast } from "@/hooks/use-action-toast";
// Importa direto de contracts/ e shared/, nunca do barrel (@/plugins/broadcast) — mesmo racional
// de outputs-section.tsx/layer-renderer.tsx: este é um "use client" component, e o barrel arrasta
// handlers server-only pro bundle do browser.
import { streamableContentTypeForExtension } from "@/plugins/broadcast/shared/video-extensions";
import type { BroadcastPlaylistItemRecord, BroadcastPlaylistRecord } from "@/plugins/broadcast/contracts/types";
import {
  addMediaAssetPlaylistItemAction,
  addNewsPlaylistItemAction,
  addScannedPlaylistItemsAction,
  addWebpagePlaylistItemAction,
  createPlaylistAction,
  deletePlaylistAction,
  deletePlaylistItemAction,
  reorderPlaylistItemsAction,
  scanPlaylistFolderAction,
  togglePlaylistItemVisibilityAction,
  updatePlaylistItemAction,
  type BroadcastActionState,
  type ScanPlaylistFolderState,
} from "./actions";

const initialState: BroadcastActionState = { error: null };
const initialScanState: ScanPlaylistFolderState = { error: null, toAdd: [], toRemove: [] };

// A pasta de vídeos não é mais escolhida aqui — toda playlist já nasce apontando pra
// public/broadcast/videos (BROADCAST_VIDEOS_FOLDER_PATH), o "Escanear pasta" de cada uma decide
// qual subconjunto desses arquivos entra. Feedback direto: "a pasta sempre vai ser
// public/broadcast/videos" — o campo era um passo a mais sem utilidade real.
function CreatePlaylistForm() {
  const [state, formAction, pending] = useActionState(createPlaylistAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Playlist criada." });

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2 rounded-panel border border-border bg-card p-3">
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor="playlist-name">Nome</label>
        <Input id="playlist-name" name="name" placeholder="Comerciais" required className="w-56" />
      </div>
      <Button type="submit" disabled={pending}>Nova playlist</Button>
    </form>
  );
}

function DeletePlaylistButton({ playlistId }: { playlistId: string }) {
  const [state, formAction, pending] = useActionState(deletePlaylistAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Playlist removida." });

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!confirm("Apagar esta playlist e todos os seus itens? Saídas que a tocam ficam sem playlist até você trocar.")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="playlistId" value={playlistId} />
      <Button type="submit" variant="destructive" size="icon" disabled={pending} aria-label="Apagar playlist">
        <Trash2 className="size-4" />
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
      <Button type="submit" variant="destructive" size="icon" disabled={pending} aria-label="Remover item">
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

// Reenvia a playlist inteira já reordenada (JSON) — mesmo padrão de academy
// (reorderLessonSectionsAction/MoveSectionButton): mais simples e mais robusto que uma lib de
// arrastar-soltar só pra isto.
function MovePlaylistItemButton({
  playlistId,
  itemIds,
  direction,
}: {
  playlistId: string;
  itemIds: string[];
  direction: "up" | "down";
}) {
  const [state, formAction, pending] = useActionState(reorderPlaylistItemsAction, initialState);
  useActionToast({ pending, error: state.error });

  return (
    <form action={formAction}>
      <input type="hidden" name="playlistId" value={playlistId} />
      <input type="hidden" name="itemIds" value={JSON.stringify(itemIds)} />
      <Button
        type="submit"
        variant="outline"
        size="icon"
        disabled={pending}
        aria-label={direction === "up" ? "Mover item para cima" : "Mover item para baixo"}
      >
        {direction === "up" ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </Button>
    </form>
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

// Campos empilhados verticalmente (label em cima, campo largura cheia) em vez de
// flex-wrap/items-end lado a lado — o layout horizontal quebrava (campos se sobrepondo/
// desalinhando) dentro do card estreito de edição; empilhado nunca depende da largura disponível
// pra ficar legível. Só título/duração/url (quando "webpage") são editáveis —
// relativePath/mediaAssetId/sourceType não, pra não deixar um item de playlist ambíguo (trocar o
// arquivo é "outro item", ver comentário do CHECK de forma no schema).
function EditPlaylistItemForm({ item, onDone }: { item: BroadcastPlaylistItemRecord; onDone: () => void }) {
  const [state, formAction, pending] = useActionState(updatePlaylistItemAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Item atualizado.", onSuccess: onDone });
  const [url, setUrl] = useState(item.url ?? "");
  const isVideo =
    item.sourceType === "local" && item.relativePath
      ? Boolean(streamableContentTypeForExtension(extensionOf(item.relativePath))?.startsWith("video/"))
      : false;

  return (
    <form
      key={`${item.id}-${item.updatedAt.getTime()}`}
      action={formAction}
      className="mt-2 space-y-3 rounded-panel border border-border/60 bg-muted/30 p-3"
    >
      <input type="hidden" name="itemId" value={item.id} />
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground" htmlFor={`${item.id}-edit-title`}>Título</label>
        <Input id={`${item.id}-edit-title`} name="title" defaultValue={item.title ?? ""} className="w-full" />
      </div>
      {item.sourceType === "webpage" && (
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-medium text-muted-foreground" htmlFor={`${item.id}-edit-url`}>Site ou rota interna</label>
            {url.startsWith("http") && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-foreground underline decoration-dotted underline-offset-2 hover:text-primary"
              >
                Testar
              </a>
            )}
          </div>
          <Input
            id={`${item.id}-edit-url`}
            name="url"
            required
            className="w-full"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
        </div>
      )}
      {/* Duração não se aplica a vídeo (toca pela duração natural do arquivo). */}
      {!isVideo && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground" htmlFor={`${item.id}-edit-duration`}>Segundos na tela</label>
          <Input
            id={`${item.id}-edit-duration`}
            name="durationSeconds"
            type="number"
            defaultValue={item.durationSeconds ?? undefined}
            className="w-32"
          />
        </div>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>Salvar</Button>
        <Button type="button" variant="outline" size="sm" onClick={onDone}>Cancelar</Button>
      </div>
    </form>
  );
}

function PlaylistItemRow({
  playlistId,
  item,
  upOrder,
  downOrder,
}: {
  playlistId: string;
  item: BroadcastPlaylistItemRecord;
  upOrder: string[] | null;
  downOrder: string[] | null;
}) {
  const [editing, setEditing] = useState(false);
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
    <div className="rounded-panel border border-border bg-card p-2.5 text-sm">
      <div className="flex items-center justify-between gap-3">
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
          {upOrder && <MovePlaylistItemButton playlistId={playlistId} itemIds={upOrder} direction="up" />}
          {downOrder && <MovePlaylistItemButton playlistId={playlistId} itemIds={downOrder} direction="down" />}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setEditing((previous) => !previous)}
            aria-label={editing ? "Fechar edição" : "Editar item"}
          >
            <Pencil className="size-4" />
          </Button>
          <ToggleItemVisibilityButton item={item} />
          <DeletePlaylistItemButton itemId={item.id} />
        </div>
      </div>
      {editing && <EditPlaylistItemForm item={item} onDone={() => setEditing(false)} />}
    </div>
  );
}

// Escanear a pasta agora só mostra uma prévia (nada é gravado) — o operador escolhe quais vídeos
// novos entram (checkbox, tudo pré-marcado) e confirma; itens que sumiram da pasta aparecem à
// parte, com o botão de apagar já existente, nunca removidos sozinhos. Pedido explícito: "quero
// poder escolher o que entra na playlist e o que não entra" — o scan antigo inseria/apagava tudo
// automaticamente.
function ScanPlaylistFlow({ playlistId, onAdded }: { playlistId: string; onAdded?: () => void }) {
  const [scanState, scanAction, scanPending] = useActionState(scanPlaylistFolderAction, initialScanState);
  const [preview, setPreview] = useState<ScanPlaylistFolderState | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useActionToast({
    pending: scanPending,
    error: scanState.error,
    onSuccess: () => {
      setPreview(scanState);
      setSelected(new Set(scanState.toAdd));
    },
  });

  const [addState, addAction, addPending] = useActionState(addScannedPlaylistItemsAction, initialState);
  useActionToast({
    pending: addPending,
    error: addState.error,
    successMessage: "Vídeos adicionados.",
    onSuccess: () => {
      setPreview(null);
      onAdded?.();
    },
  });

  function toggle(relativePath: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(relativePath)) next.delete(relativePath);
      else next.add(relativePath);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Escaneia a pasta configurada e mostra o que encontrou — você escolhe o que entra na playlist.
      </p>
      <form action={scanAction}>
        <input type="hidden" name="playlistId" value={playlistId} />
        <Button type="submit" variant="outline" size="sm" disabled={scanPending} className="w-full sm:w-auto">
          <RefreshCw className="size-4" />
          Escanear pasta
        </Button>
      </form>

      {preview && (
        <div className="space-y-3 rounded-panel border border-border/60 bg-card p-3">
          {preview.toAdd.length === 0 && preview.toRemove.length === 0 && (
            <p className="text-xs text-muted-foreground">Nenhuma novidade — a playlist já reflete o que está na pasta.</p>
          )}

          {preview.toAdd.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">
                {preview.toAdd.length} vídeo{preview.toAdd.length === 1 ? "" : "s"} encontrado{preview.toAdd.length === 1 ? "" : "s"} na
                pasta — escolha o que entra:
              </p>
              <ul className="max-h-48 space-y-1 overflow-y-auto">
                {preview.toAdd.map((relativePath) => (
                  <li key={relativePath}>
                    <label className="flex items-center gap-2 rounded-md p-1.5 text-sm text-foreground hover:bg-muted/60">
                      <input
                        type="checkbox"
                        checked={selected.has(relativePath)}
                        onChange={() => toggle(relativePath)}
                        className="size-4 shrink-0 rounded border-border"
                      />
                      <span className="min-w-0 truncate">{relativePath}</span>
                    </label>
                  </li>
                ))}
              </ul>
              <form action={addAction} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="playlistId" value={playlistId} />
                <input type="hidden" name="relativePaths" value={JSON.stringify([...selected])} />
                <Button type="submit" size="sm" disabled={addPending || selected.size === 0}>
                  Adicionar selecionados ({selected.size})
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setPreview(null)}>
                  Cancelar
                </Button>
              </form>
            </div>
          )}

          {preview.toRemove.length > 0 && (
            <div className="space-y-1.5 border-t border-border/60 pt-2">
              <p className="text-xs font-medium text-warning">
                {preview.toRemove.length} item{preview.toRemove.length === 1 ? "" : "s"} da playlist não{" "}
                {preview.toRemove.length === 1 ? "foi encontrado" : "foram encontrados"} mais na pasta:
              </p>
              {preview.toRemove.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="min-w-0 truncate">{item.relativePath}</span>
                  <DeletePlaylistItemButton itemId={item.id} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AddMediaAssetItemForm({ playlistId, onAdded }: { playlistId: string; onAdded?: () => void }) {
  const [state, formAction, pending] = useActionState(addMediaAssetPlaylistItemAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Item adicionado.", onSuccess: onAdded });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="playlistId" value={playlistId} />
      <MediaPickerField name="mediaAssetId" label="Vídeo ou imagem da biblioteca" />
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground" htmlFor={`${playlistId}-media-title`}>Título (opcional)</label>
        <Input id={`${playlistId}-media-title`} name="title" className="w-full" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground" htmlFor={`${playlistId}-media-duration`}>
          Segundos na tela (só p/ imagem)
        </label>
        <Input id={`${playlistId}-media-duration`} name="durationSeconds" type="number" placeholder="15" className="w-32" />
      </div>
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">Adicionar</Button>
    </form>
  );
}

function AddWebpageItemForm({ playlistId, onAdded }: { playlistId: string; onAdded?: () => void }) {
  const [state, formAction, pending] = useActionState(addWebpagePlaylistItemAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Página adicionada.", onSuccess: onAdded });
  // Controlado só pra habilitar o link "Testar" com a URL atual — a submissão continua via
  // FormData (name="url"), igual às outras <Input> não controladas deste arquivo.
  const [url, setUrl] = useState("");

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="playlistId" value={playlistId} />
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-medium text-muted-foreground" htmlFor={`${playlistId}-webpage-url`}>Site ou rota interna</label>
          {url.startsWith("http") && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-foreground underline decoration-dotted underline-offset-2 hover:text-primary"
            >
              Testar
            </a>
          )}
        </div>
        <Input
          id={`${playlistId}-webpage-url`}
          name="url"
          placeholder="https://... ou /cursos"
          required
          className="w-full"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground" htmlFor={`${playlistId}-webpage-title`}>Título (opcional)</label>
        <Input id={`${playlistId}-webpage-title`} name="title" className="w-full" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground" htmlFor={`${playlistId}-webpage-duration`}>
          Segundos na tela (padrão 60)
        </label>
        <Input id={`${playlistId}-webpage-duration`} name="durationSeconds" type="number" placeholder="60" className="w-32" />
      </div>
      <p className="text-xs text-warning">
        Muitos sites (Google, redes sociais, bancos) bloqueiam ser exibidos dentro de outra página e vão ficar em branco na TV. Use o
        link &quot;Testar&quot; acima pra conferir antes de adicionar — rotas internas do próprio site sempre funcionam.
      </p>
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">Adicionar</Button>
    </form>
  );
}

function AddNewsItemForm({ playlistId, onAdded }: { playlistId: string; onAdded?: () => void }) {
  const [state, formAction, pending] = useActionState(addNewsPlaylistItemAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Bloco de notícias adicionado.", onSuccess: onAdded });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="playlistId" value={playlistId} />
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground" htmlFor={`${playlistId}-news-title`}>Título (opcional)</label>
        <Input id={`${playlistId}-news-title`} name="title" placeholder="Notícias" className="w-full" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground" htmlFor={`${playlistId}-news-duration`}>
          Segundos do bloco (padrão 30)
        </label>
        <Input id={`${playlistId}-news-duration`} name="durationSeconds" type="number" placeholder="30" className="w-32" />
      </div>
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">Adicionar</Button>
    </form>
  );
}

type AddItemKind = "scan" | "media" | "webpage" | "news";

// Ícone renderizado (não componente) — mesmo racional de renderItemIcon.
function renderAddOptionIcon(kind: AddItemKind): ReactNode {
  const className = "size-3.5";
  switch (kind) {
    case "scan":
      return <Clapperboard className={className} aria-hidden="true" />;
    case "media":
      return <ImageIcon className={className} aria-hidden="true" />;
    case "webpage":
      return <Globe className={className} aria-hidden="true" />;
    case "news":
      return <Newspaper className={className} aria-hidden="true" />;
  }
}

// Chips (um por tipo de conteúdo) + um único formulário visível por vez, em vez dos quatro
// formulários sempre abertos lado a lado — reduz o ruído visual e dá largura cheia pro formulário
// ativo (a causa raiz do card de "página web" quebrado era espaço insuficiente numa grade de 2
// colunas; com só um formulário por vez, ele sempre tem a largura inteira da seção).
function PlaylistAddSection({ playlist }: { playlist: BroadcastPlaylistRecord }) {
  const [active, setActive] = useState<AddItemKind | null>(null);
  const close = () => setActive(null);

  const options: { kind: AddItemKind; label: string }[] = [
    ...(playlist.folderPath ? [{ kind: "scan" as const, label: "Vídeos da pasta" }] : []),
    { kind: "media", label: "Mídia avulsa" },
    { kind: "webpage", label: "Página web" },
    { kind: "news", label: "Bloco de notícias" },
  ];

  return (
    <div className="space-y-3 border-t border-border/60 pt-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Adicionar à playlist</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.kind}
            type="button"
            onClick={() => setActive((current) => (current === option.kind ? null : option.kind))}
            className={
              active === option.kind
                ? "flex items-center gap-2 rounded-full border border-primary bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary ui-motion-base"
                : "flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground ui-motion-base hover:border-ring"
            }
          >
            {renderAddOptionIcon(option.kind)}
            {option.label}
          </button>
        ))}
      </div>

      {active && (
        <div className="rounded-panel border border-border/60 bg-muted/20 p-3">
          {active === "scan" && <ScanPlaylistFlow playlistId={playlist.id} onAdded={close} />}
          {active === "media" && <AddMediaAssetItemForm playlistId={playlist.id} onAdded={close} />}
          {active === "webpage" && <AddWebpageItemForm playlistId={playlist.id} onAdded={close} />}
          {active === "news" && <AddNewsItemForm playlistId={playlist.id} onAdded={close} />}
        </div>
      )}
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
                {/* stopPropagation — sem isso, clicar em "apagar" também alterna o <details> aberto/fechado
                    (o clique borbulha pro <summary>, que é o disclosure trigger nativo). */}
                <div onClick={(event) => event.stopPropagation()}>
                  <DeletePlaylistButton playlistId={playlist.id} />
                </div>
              </summary>
              <div className="mt-3 space-y-3">
                <div className="space-y-2">
                  {items.map((item, index) => {
                    const upOrder =
                      index > 0
                        ? [...items.slice(0, index - 1), items[index], items[index - 1], ...items.slice(index + 1)].map((i) => i.id)
                        : null;
                    const downOrder =
                      index < items.length - 1
                        ? [...items.slice(0, index), items[index + 1], items[index], ...items.slice(index + 2)].map((i) => i.id)
                        : null;
                    return (
                      <PlaylistItemRow key={item.id} playlistId={playlist.id} item={item} upOrder={upOrder} downOrder={downOrder} />
                    );
                  })}
                  {items.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      {playlist.folderPath ? 'Nenhum vídeo ainda — clique em "Vídeos da pasta" abaixo pra escanear.' : "Nenhum item ainda."}
                    </p>
                  )}
                </div>

                <PlaylistAddSection playlist={playlist} />
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
