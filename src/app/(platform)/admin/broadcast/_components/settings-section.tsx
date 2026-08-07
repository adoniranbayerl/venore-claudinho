"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionToast } from "@/hooks/use-action-toast";
import { updateBroadcastRegionAction, updateBroadcastRootFolderAction, type BroadcastActionState } from "../actions";

const initialState: BroadcastActionState = { error: null };

function RootFolderForm({ rootFolder }: { rootFolder: string }) {
  const [state, formAction, pending] = useActionState(updateBroadcastRootFolderAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Pasta raiz salva." });

  return (
    <form action={formAction} className="max-w-xl space-y-2 rounded-panel border border-border bg-card p-3">
      <label className="text-sm font-medium text-foreground" htmlFor="root-folder">Pasta raiz de vídeos no servidor</label>
      <p className="text-xs text-muted-foreground">
        Caminho onde as pastas das playlists locais vivem — nunca uma pasta acessível publicamente. Cada playlist
        aponta pra uma subpasta relativa a esta raiz.
      </p>
      <Input id="root-folder" name="rootFolder" defaultValue={rootFolder} placeholder="public/broadcast" />
      <Button type="submit" disabled={pending}>Salvar</Button>
    </form>
  );
}

function RegionForm({ region }: { region: string }) {
  const [state, formAction, pending] = useActionState(updateBroadcastRegionAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Região salva." });

  return (
    <form action={formAction} className="max-w-xl space-y-2 rounded-panel border border-border bg-card p-3">
      <label className="text-sm font-medium text-foreground" htmlFor="region">Região (cidade)</label>
      <p className="text-xs text-muted-foreground">
        Usada pelas camadas &quot;Relógio e clima&quot; e &quot;Notícias da região&quot;. Digite o nome da cidade.
      </p>
      <Input id="region" name="region" defaultValue={region} placeholder="Curitiba, PR" />
      <Button type="submit" disabled={pending}>Salvar</Button>
    </form>
  );
}

export function SettingsSection({ rootFolder, region }: { rootFolder: string; region: string }) {
  return (
    <div className="space-y-4">
      <RootFolderForm rootFolder={rootFolder} />
      <RegionForm region={region} />
    </div>
  );
}
