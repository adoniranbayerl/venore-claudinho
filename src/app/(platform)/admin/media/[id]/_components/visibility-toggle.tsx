"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { updateMediaVisibilityAction, type MediaActionState } from "../../actions";

const initialState: MediaActionState = { error: null };

// Efeito explicado em linguagem de usuário (docs do pedido: "editável por quem tem direito, com
// o efeito explicado") — a mensagem some/aparece conforme o estado atual, nunca genérica tipo
// "alterar visibilidade".
export function VisibilityToggle({ id, visibility }: { id: string; visibility: "private" | "public" }) {
  const [state, formAction, pending] = useActionState(updateMediaVisibilityAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Visibilidade atualizada." });

  const nextVisibility = visibility === "public" ? "private" : "public";
  const explanation =
    visibility === "public"
      ? "Público: qualquer pessoa autenticada pode ver e usar este arquivo."
      : "Privado: só você e administradores de mídia podem ver este arquivo.";
  const actionLabel = visibility === "public" ? "Tornar privado" : "Tornar público";
  const nextExplanation =
    nextVisibility === "public"
      ? "Ao tornar público, qualquer pessoa autenticada vai poder ver e usar este arquivo."
      : "Ao tornar privado, só você e administradores de mídia vão poder ver este arquivo.";

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{explanation}</p>
      <form action={formAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="visibility" value={nextVisibility} />
        <Button type="submit" variant="outline" size="sm" disabled={pending} title={nextExplanation}>
          {actionLabel}
        </Button>
      </form>
    </div>
  );
}
