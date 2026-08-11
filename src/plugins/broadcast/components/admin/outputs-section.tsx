"use client";

import { useActionState, useState } from "react";
import { Check, Copy, Eye, EyeOff, PanelBottomClose, PanelBottomOpen, PanelRightClose, PanelRightOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActionToast } from "@/hooks/use-action-toast";
// Importa direto de contracts/, nunca do barrel (@/plugins/broadcast) — mesmo racional de
// playlists-section.tsx/agenda-section.tsx.
import type { BroadcastOutputRecord, BroadcastPlaylistRecord } from "@/plugins/broadcast/contracts/types";
import {
  clearAlertAction,
  createOutputAction,
  deleteOutputAction,
  publishAlertAction,
  setOutputDrawerAction,
  setOutputEditorsAction,
  setOutputFooterAction,
  setOutputPlaylistAction,
  type BroadcastActionState,
} from "./actions";

const initialState: BroadcastActionState = { error: null };

// Mesmo racional de AssignableUser em agenda-section.tsx: tipo inline, nunca importa UserRef de
// @/contexts/auth (barrel arrasta next-auth/server pro bundle do browser).
type AssignableUser = { id: string; name: string | null; email: string };

// Toda saída nasce com sua cena/camadas fixas já prontas (vídeo + agenda + aviso rápido) — não há
// mais o que escolher além do nome e da playlist que toca (pedido explícito: "não vamos precisar
// configurar manualmente as camadas, você já define isso").
function CreateOutputForm({ playlists }: { playlists: BroadcastPlaylistRecord[] }) {
  const [state, formAction, pending] = useActionState(createOutputAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Saída criada." });

  if (playlists.length === 0) {
    return (
      <p className="rounded-panel border border-border bg-card p-3 text-sm text-warning">
        Crie uma playlist na aba &quot;Playlists&quot; antes de criar uma saída.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2 rounded-panel border border-border bg-card p-3">
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor="output-name">Nome</label>
        <Input id="output-name" name="name" placeholder="TV da recepção" required className="w-56" />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor="output-playlist">Playlist</label>
        <Select name="playlistId" required>
          <SelectTrigger id="output-playlist" className="w-56"><SelectValue placeholder="Escolha uma playlist..." /></SelectTrigger>
          <SelectContent>
            {playlists.map((playlist) => (
              <SelectItem key={playlist.id} value={playlist.id}>{playlist.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={pending}>Nova saída</Button>
    </form>
  );
}

function CopyOutputUrlButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const path = `/broadcast/out/${token}`;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
        void navigator.clipboard.writeText(url).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? "Link copiado" : "Copiar link da TV"}
    </Button>
  );
}

// Preview ao vivo — monta o iframe só quando o operador pede (pedido explícito: "seria muito
// interessante ter um preview da tela"). Mount-on-demand de propósito: cada preview aberto é uma
// página de saída inteira rodando (SSE + polling próprios, ver output-canvas.tsx), não algo pra
// deixar sempre ativo pra cada saída na lista. Dimensão de design da view de saída é 1280×720
// (16:9); o preview escala isso pra caber numa caixa pequena via CSS transform, não redimensiona o
// conteúdo real.
const PREVIEW_DESIGN_WIDTH = 1280;
const PREVIEW_DESIGN_HEIGHT = 720;
const PREVIEW_BOX_WIDTH = 320;
const PREVIEW_SCALE = PREVIEW_BOX_WIDTH / PREVIEW_DESIGN_WIDTH;

function OutputPreviewToggle({ token }: { token: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen((previous) => !previous)}>
        {open ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        {open ? "Fechar preview" : "Ver preview"}
      </Button>
      {open && (
        <div
          className="relative mt-2 overflow-hidden rounded-md border border-border bg-black"
          style={{ width: PREVIEW_BOX_WIDTH, height: PREVIEW_BOX_WIDTH * (PREVIEW_DESIGN_HEIGHT / PREVIEW_DESIGN_WIDTH) }}
        >
          <iframe
            src={`/broadcast/out/${token}`}
            title="Preview da saída"
            style={{
              width: PREVIEW_DESIGN_WIDTH,
              height: PREVIEW_DESIGN_HEIGHT,
              transform: `scale(${PREVIEW_SCALE})`,
              transformOrigin: "top left",
              border: 0,
              pointerEvents: "none",
            }}
          />
        </div>
      )}
    </div>
  );
}

function SetOutputPlaylistForm({
  output,
  playlists,
  currentPlaylistId,
}: {
  output: BroadcastOutputRecord;
  playlists: BroadcastPlaylistRecord[];
  currentPlaylistId: string | null;
}) {
  const [state, formAction, pending] = useActionState(setOutputPlaylistAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Playlist trocada." });

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="outputId" value={output.id} />
      <Select name="playlistId" defaultValue={currentPlaylistId ?? undefined}>
        <SelectTrigger className="w-48"><SelectValue placeholder="Escolha uma playlist..." /></SelectTrigger>
        <SelectContent>
          {playlists.map((playlist) => (
            <SelectItem key={playlist.id} value={playlist.id}>{playlist.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" size="sm" disabled={pending}>Trocar</Button>
    </form>
  );
}

// drawerOpen no banco virou "a coluna de agenda está aberta" (ver layer-renderer.tsx) — um dos
// dois controles estruturais que sobraram pro operador (pedido explícito: "apenas quero ter a
// opção de abrir e fechar o sidebar de agenda", depois "além de fechar a agenda, deve ser possível
// fechar o footer" — ver ToggleFooterButton logo abaixo).
function ToggleAgendaButton({ output }: { output: BroadcastOutputRecord }) {
  const [state, formAction, pending] = useActionState(setOutputDrawerAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Atualizado." });

  return (
    <form action={formAction}>
      <input type="hidden" name="outputId" value={output.id} />
      <input type="hidden" name="drawerOpen" value={output.drawerOpen ? "false" : "true"} />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {output.drawerOpen ? <PanelRightClose className="size-4" /> : <PanelRightOpen className="size-4" />}
        {output.drawerOpen ? "Fechar agenda" : "Abrir agenda"}
      </Button>
    </form>
  );
}

function ToggleFooterButton({ output }: { output: BroadcastOutputRecord }) {
  const [state, formAction, pending] = useActionState(setOutputFooterAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Atualizado." });

  return (
    <form action={formAction}>
      <input type="hidden" name="outputId" value={output.id} />
      <input type="hidden" name="footerOpen" value={output.footerOpen ? "false" : "true"} />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {output.footerOpen ? <PanelBottomClose className="size-4" /> : <PanelBottomOpen className="size-4" />}
        {output.footerOpen ? "Fechar rodapé" : "Abrir rodapé"}
      </Button>
    </form>
  );
}

function DeleteOutputButton({ outputId }: { outputId: string }) {
  const [state, formAction, pending] = useActionState(deleteOutputAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Saída apagada." });

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!confirm("Apagar esta tela? O link que ela usa para de funcionar.")) event.preventDefault();
      }}
    >
      <input type="hidden" name="outputId" value={outputId} />
      <Button type="submit" variant="destructive" size="icon" disabled={pending} aria-label="Apagar tela">
        <Trash2 className="size-4" />
      </Button>
    </form>
  );
}

// "Responsável" pela tela — mesmo racional/padrão de AgendaEditorsForm (agenda-section.tsx). A
// atribuição sozinha não dá acesso: a pessoa também precisa ter o papel "Editar telas atribuídas"
// (broadcast.outputs.manage) em /admin/rbac.
function OutputEditorsForm({
  outputId,
  allUsers,
  selectedUserIds,
}: {
  outputId: string;
  allUsers: AssignableUser[];
  selectedUserIds: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedUserIds));
  const [state, formAction, pending] = useActionState(setOutputEditorsAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Responsáveis atualizados." });

  function toggle(userId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  return (
    <form action={formAction} className="space-y-2 rounded-panel border border-border/60 bg-muted/20 p-2.5">
      <input type="hidden" name="outputId" value={outputId} />
      <input type="hidden" name="userIds" value={JSON.stringify([...selected])} />
      <p className="text-xs font-medium text-foreground">Responsável por esta tela</p>
      <p className="text-xs text-muted-foreground">
        Pessoas marcadas podem editar só esta tela — precisam também ter o papel &quot;Editar telas atribuídas&quot; em
        Papéis e Permissões.
      </p>
      {allUsers.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhum usuário cadastrado ainda.</p>
      ) : (
        <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto">
          {allUsers.map((user) => (
            <label key={user.id} className="flex items-center gap-1.5 text-sm text-foreground">
              <input
                type="checkbox"
                checked={selected.has(user.id)}
                onChange={() => toggle(user.id)}
                className="size-4 shrink-0 rounded border-border"
              />
              <span className="truncate">{user.name ?? user.email} ({user.email})</span>
            </label>
          ))}
        </div>
      )}
      <Button type="submit" size="sm" variant="outline" disabled={pending}>Salvar responsáveis</Button>
    </form>
  );
}

// Global (não por saída) — aparece em toda saída, e some sozinho quando a duração passa; "Remover
// agora" força isso antes do tempo, se precisar.
function QuickAlertPanel() {
  const [publishState, publishFormAction, publishPending] = useActionState(publishAlertAction, initialState);
  useActionToast({ pending: publishPending, error: publishState.error, successMessage: "Aviso publicado." });

  const [clearState, clearFormAction, clearPending] = useActionState(clearAlertAction, initialState);
  useActionToast({ pending: clearPending, error: clearState.error, successMessage: "Aviso removido." });

  return (
    <div className="space-y-2 rounded-panel border border-border bg-card p-3">
      <p className="text-sm font-medium text-foreground">Aviso rápido</p>
      <p className="text-xs text-muted-foreground">
        Aparece em cima do conteúdo (empurrando, sem cobrir nada) em qualquer tela, e some sozinho depois do tempo.
      </p>
      <form action={publishFormAction} className="flex flex-wrap items-end gap-2">
        <div className="min-w-64 flex-1 space-y-1">
          <label className="text-xs text-muted-foreground" htmlFor="alert-message">Mensagem</label>
          <Input id="alert-message" name="message" placeholder="Reunião às 15h no auditório" required />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground" htmlFor="alert-duration">Segundos na tela</label>
          <Input id="alert-duration" name="durationSeconds" type="number" defaultValue={30} className="w-24" />
        </div>
        <Button type="submit" disabled={publishPending}>Publicar aviso</Button>
      </form>
      <form action={clearFormAction}>
        <Button type="submit" variant="outline" size="sm" disabled={clearPending}>Remover agora</Button>
      </form>
    </div>
  );
}

export function OutputsSection({
  outputs,
  playlists,
  outputPlaylistById,
  canManageAll = true,
  allUsers = [],
  outputEditorUserIdsByOutputId = {},
}: {
  outputs: BroadcastOutputRecord[];
  playlists: BroadcastPlaylistRecord[];
  outputPlaylistById: Record<string, string | null>;
  // false pra um ator sem broadcast.manage (só broadcast.outputs.manage — "responsável" por
  // telas específicas, ver page.tsx) — esconde aviso rápido, criar/apagar tela e a atribuição de
  // responsáveis.
  canManageAll?: boolean;
  allUsers?: AssignableUser[];
  outputEditorUserIdsByOutputId?: Record<string, string[]>;
}) {
  return (
    <div className="space-y-4">
      {canManageAll && <QuickAlertPanel />}
      {canManageAll && <CreateOutputForm playlists={playlists} />}
      {outputs.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {canManageAll ? "Nenhuma tela cadastrada ainda." : "Nenhuma tela foi atribuída a você ainda."}
        </p>
      )}
      <div className="space-y-3">
        {outputs.map((output) => (
          <div key={output.id} className="space-y-2 rounded-panel border border-border bg-card p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium text-foreground">{output.name}</span>
              <div className="flex items-center gap-1.5">
                <CopyOutputUrlButton token={output.token} />
                {canManageAll && <DeleteOutputButton outputId={output.id} />}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <SetOutputPlaylistForm output={output} playlists={playlists} currentPlaylistId={outputPlaylistById[output.id] ?? null} />
              <ToggleAgendaButton output={output} />
              <ToggleFooterButton output={output} />
            </div>
            <OutputPreviewToggle token={output.token} />
            {canManageAll && (
              <OutputEditorsForm outputId={output.id} allUsers={allUsers} selectedUserIds={outputEditorUserIdsByOutputId[output.id] ?? []} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
