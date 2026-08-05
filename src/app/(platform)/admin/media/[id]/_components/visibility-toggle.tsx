"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MediaVisibility } from "@/contexts/media";
import { useActionToast } from "@/hooks/use-action-toast";
import { updateMediaVisibilityAction, type MediaActionState } from "../../actions";

const initialState: MediaActionState = { error: null };

const VISIBILITY_OPTIONS: { value: MediaVisibility; label: string; explanation: string }[] = [
  { value: "public", label: "Público", explanation: "Qualquer pessoa autenticada pode ver e usar este arquivo." },
  {
    value: "restricted",
    label: "Restrito",
    explanation:
      'Pensado pra uso só no contexto onde foi enviado — hoje é um rótulo administrativo, o bloqueio de uso fora do contexto de origem ainda não existe (Known Gap).',
  },
  { value: "private", label: "Privado", explanation: "Só você e administradores de mídia podem ver este arquivo." },
];

// Efeito explicado em linguagem de usuário (docs do pedido: "editável por quem tem direito, com
// o efeito explicado") — a explicação muda conforme a opção escolhida no select, nunca genérica
// tipo "alterar visibilidade". Virou select de 3 estados (Fase 4/M3), não mais um botão binário.
export function VisibilityToggle({ id, visibility }: { id: string; visibility: MediaVisibility }) {
  const [state, formAction, pending] = useActionState(updateMediaVisibilityAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Visibilidade atualizada." });

  const current = VISIBILITY_OPTIONS.find((option) => option.value === visibility) ?? VISIBILITY_OPTIONS[2];

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <Select name="visibility" defaultValue={visibility}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {VISIBILITY_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        Salvar
      </Button>
      <p className="w-full text-xs text-muted-foreground">{current.explanation}</p>
    </form>
  );
}
