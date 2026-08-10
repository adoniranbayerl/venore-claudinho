"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionToast } from "@/hooks/use-action-toast";
import {
  updateBroadcastBrandColorAction,
  updateBroadcastNewsExcludeKeywordsAction,
  updateBroadcastRegionAction,
  type BroadcastActionState,
} from "../actions";

const initialState: BroadcastActionState = { error: null };

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

function NewsExcludeKeywordsForm({ newsExcludeKeywords }: { newsExcludeKeywords: string }) {
  const [state, formAction, pending] = useActionState(updateBroadcastNewsExcludeKeywordsAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Palavras-chave salvas." });

  return (
    <form action={formAction} className="max-w-xl space-y-2 rounded-panel border border-border bg-card p-3">
      <label className="text-sm font-medium text-foreground" htmlFor="news-exclude-keywords">Excluir notícias com estas palavras</label>
      <p className="text-xs text-muted-foreground">
        Qualquer manchete cujo título contenha uma destas palavras não aparece na TV. Separe por vírgula.
      </p>
      <Input id="news-exclude-keywords" name="newsExcludeKeywords" defaultValue={newsExcludeKeywords} placeholder="futebol, política" />
      <Button type="submit" disabled={pending}>Salvar</Button>
    </form>
  );
}

function BrandColorForm({ brandColor }: { brandColor: string }) {
  const [state, formAction, pending] = useActionState(updateBroadcastBrandColorAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Cor da marca salva." });

  return (
    <form action={formAction} className="max-w-xl space-y-2 rounded-panel border border-border bg-card p-3">
      <label className="text-sm font-medium text-foreground" htmlFor="brand-color">Cor da barra de marca</label>
      <p className="text-xs text-muted-foreground">
        Fundo da barra inferior da view principal (vídeo/playlist) — mostra a logo, o relógio e a temperatura.
      </p>
      <input
        id="brand-color"
        name="brandColor"
        type="color"
        defaultValue={brandColor}
        className="h-9 w-16 cursor-pointer rounded-md border border-border"
      />
      <div>
        <Button type="submit" disabled={pending}>Salvar</Button>
      </div>
    </form>
  );
}

export function SettingsSection({
  region,
  brandColor,
  newsExcludeKeywords,
}: {
  region: string;
  brandColor: string;
  newsExcludeKeywords: string;
}) {
  return (
    <div className="space-y-4">
      <RegionForm region={region} />
      <BrandColorForm brandColor={brandColor} />
      <NewsExcludeKeywordsForm newsExcludeKeywords={newsExcludeKeywords} />
    </div>
  );
}
