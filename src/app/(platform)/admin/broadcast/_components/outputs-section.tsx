"use client";

import { useActionState, useState } from "react";
import { Check, Copy, PanelRightClose, PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActionToast } from "@/hooks/use-action-toast";
// Importa direto de contracts/, nunca do barrel (@/plugins/broadcast) — mesmo racional de
// scenes-section.tsx.
import type { BroadcastOutputRecord, BroadcastSceneRecord } from "@/plugins/broadcast/contracts/types";
import {
  clearAlertAction,
  createOutputAction,
  publishAlertAction,
  setOutputDrawerAction,
  setOutputSceneAction,
  type BroadcastActionState,
} from "../actions";

const initialState: BroadcastActionState = { error: null };

// Radix Select não aceita SelectItem com value="" — usa um sentinel traduzido de volta pra
// null/"" em setOutputSceneAction.
const NO_SCENE_VALUE = "none";

function CreateOutputForm() {
  const [state, formAction, pending] = useActionState(createOutputAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Saída criada." });

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2 rounded-panel border border-border bg-card p-3">
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground" htmlFor="output-name">Nome</label>
        <Input id="output-name" name="name" placeholder="TV da recepção" required className="w-56" />
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

function SetOutputSceneForm({ output, scenes }: { output: BroadcastOutputRecord; scenes: BroadcastSceneRecord[] }) {
  const [state, formAction, pending] = useActionState(setOutputSceneAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Cena trocada." });

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="outputId" value={output.id} />
      <Select name="sceneId" defaultValue={output.currentSceneId ?? NO_SCENE_VALUE}>
        <SelectTrigger className="w-48"><SelectValue placeholder="Escolha uma cena..." /></SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_SCENE_VALUE}>Nenhuma cena (tela preta)</SelectItem>
          {scenes.map((scene) => (
            <SelectItem key={scene.id} value={scene.id}>{scene.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" size="sm" disabled={pending}>Colocar no ar</Button>
    </form>
  );
}

function ToggleDrawerButton({ output }: { output: BroadcastOutputRecord }) {
  const [state, formAction, pending] = useActionState(setOutputDrawerAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Atualizado." });

  return (
    <form action={formAction}>
      <input type="hidden" name="outputId" value={output.id} />
      <input type="hidden" name="drawerOpen" value={output.drawerOpen ? "false" : "true"} />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {output.drawerOpen ? <PanelRightClose className="size-4" /> : <PanelRightOpen className="size-4" />}
        {output.drawerOpen ? "Fechar gaveta de informações" : "Abrir gaveta de informações"}
      </Button>
    </form>
  );
}

// Global (não por saída) — aparece em toda saída cuja cena atual tenha uma camada "Aviso rápido".
// Some sozinho quando a duração passa; "Remover agora" força isso antes do tempo, se precisar.
function QuickAlertPanel() {
  const [publishState, publishFormAction, publishPending] = useActionState(publishAlertAction, initialState);
  useActionToast({ pending: publishPending, error: publishState.error, successMessage: "Aviso publicado." });

  const [clearState, clearFormAction, clearPending] = useActionState(clearAlertAction, initialState);
  useActionToast({ pending: clearPending, error: clearState.error, successMessage: "Aviso removido." });

  return (
    <div className="space-y-2 rounded-panel border border-border bg-card p-3">
      <p className="text-sm font-medium text-foreground">Aviso rápido</p>
      <p className="text-xs text-muted-foreground">
        Aparece sobre tudo, em qualquer saída cuja cena tenha a camada &quot;Aviso rápido&quot;, e some sozinho depois do tempo.
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

export function OutputsSection({ outputs, scenes }: { outputs: BroadcastOutputRecord[]; scenes: BroadcastSceneRecord[] }) {
  return (
    <div className="space-y-4">
      <QuickAlertPanel />
      <CreateOutputForm />
      {outputs.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma saída cadastrada ainda.</p>}
      <div className="space-y-3">
        {outputs.map((output) => (
          <div key={output.id} className="space-y-2 rounded-panel border border-border bg-card p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium text-foreground">{output.name}</span>
              <CopyOutputUrlButton token={output.token} />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <SetOutputSceneForm output={output} scenes={scenes} />
              <ToggleDrawerButton output={output} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
