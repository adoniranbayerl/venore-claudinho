"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActionToast } from "@/hooks/use-action-toast";
import {
  updateBroadcastAgendaAnimationStyleAction,
  updateBroadcastAgendaViewSizeAction,
  updateBroadcastBrandColorAction,
  updateBroadcastNewsExcludeKeywordsAction,
  updateBroadcastRegionAction,
  type BroadcastActionState,
} from "./actions";

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

// Select (Radix) não expõe o valor via name/FormData sozinho — mesmo padrão já usado no seletor
// de dia da semana do evento de agenda (agenda-section.tsx): hidden input sincronizado por
// onValueChange é o que a server action de fato lê.
function AgendaAnimationStyleForm({ agendaAnimationStyle }: { agendaAnimationStyle: string }) {
  const [state, formAction, pending] = useActionState(updateBroadcastAgendaAnimationStyleAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Estilo de animação salvo." });
  const [value, setValue] = useState(agendaAnimationStyle === "cascade" ? "cascade" : "fade");

  return (
    <form action={formAction} className="max-w-xl space-y-2 rounded-panel border border-border bg-card p-3">
      <label className="text-sm font-medium text-foreground" htmlFor="agenda-animation-style">Estilo de animação da agenda</label>
      <p className="text-xs text-muted-foreground">
        Como os cards de evento entram na tela ao trocar de agenda no rodízio da camada &quot;Agenda&quot;.
      </p>
      <input type="hidden" name="agendaAnimationStyle" value={value} />
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger id="agenda-animation-style" className="w-full sm:w-72">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="fade">Fade (bloco inteiro surge junto)</SelectItem>
          <SelectItem value="cascade">Cascata (cards entram em sequência, da direita)</SelectItem>
        </SelectContent>
      </Select>
      <div>
        <Button type="submit" disabled={pending}>Salvar</Button>
      </div>
    </form>
  );
}

// Mesmo padrão de AgendaAnimationStyleForm acima (hidden input sincronizado por onValueChange).
// Largura da agenda e altura da BrandFooterBar escalam JUNTAS a partir desta única configuração
// (ver BROADCAST_AGENDA_VIEW_SIZE_SCALE) — pedido explícito: "Quero que a Agenda seja maior,
// consequentemente vai aumentar o footer".
function AgendaViewSizeForm({ agendaViewSize }: { agendaViewSize: string }) {
  const [state, formAction, pending] = useActionState(updateBroadcastAgendaViewSizeAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Tamanho da view salvo." });
  const [value, setValue] = useState(agendaViewSize === "padrao" || agendaViewSize === "extra-grande" ? agendaViewSize : "grande");

  return (
    <form action={formAction} className="max-w-xl space-y-2 rounded-panel border border-border bg-card p-3">
      <label className="text-sm font-medium text-foreground" htmlFor="agenda-view-size">Tamanho da coluna de agenda</label>
      <p className="text-xs text-muted-foreground">
        Largura da coluna de agenda e altura da barra de marca (rodapé) na view principal — as duas crescem juntas.
      </p>
      <input type="hidden" name="agendaViewSize" value={value} />
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger id="agenda-view-size" className="w-full sm:w-72">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="padrao">Padrão</SelectItem>
          <SelectItem value="grande">Grande</SelectItem>
          <SelectItem value="extra-grande">Extra grande</SelectItem>
        </SelectContent>
      </Select>
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
  agendaAnimationStyle,
  agendaViewSize,
}: {
  region: string;
  brandColor: string;
  newsExcludeKeywords: string;
  agendaAnimationStyle: string;
  agendaViewSize: string;
}) {
  return (
    <div className="space-y-4">
      <RegionForm region={region} />
      <BrandColorForm brandColor={brandColor} />
      <AgendaAnimationStyleForm agendaAnimationStyle={agendaAnimationStyle} />
      <AgendaViewSizeForm agendaViewSize={agendaViewSize} />
      <NewsExcludeKeywordsForm newsExcludeKeywords={newsExcludeKeywords} />
    </div>
  );
}
