"use client";

import { useActionState, useRef } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { clearEventsAction, getEventsClearSummaryAction, type ClearEventsActionState } from "../actions";

const initialState: ClearEventsActionState = { error: null };

// Mesmo padrão de DeleteMediaButton (admin/media/_components/delete-media-button.tsx): busca a
// contagem antes de confirmar, só reenvia com confirmed=true depois do usuário aceitar.
export function ClearEventsButton() {
  const [state, formAction, pending] = useActionState(clearEventsAction, initialState);
  useActionToast({
    pending,
    error: state.error,
    successMessage: "Log operacional limpo.",
  });

  const bypassConfirmRef = useRef(false);
  const confirmedInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (bypassConfirmRef.current) {
      bypassConfirmRef.current = false;
      return;
    }

    event.preventDefault();
    const count = await getEventsClearSummaryAction();

    const message =
      count > 0
        ? `${count} registro${count === 1 ? "" : "s"} de log operacional ${count === 1 ? "será removido" : "serão removidos"} permanentemente. Esta ação não afeta a trilha de auditoria de segurança. Confirmar?`
        : "Não há registros para remover.";

    if (count === 0 || !window.confirm(message)) {
      return;
    }

    if (confirmedInputRef.current) {
      confirmedInputRef.current.value = "true";
    }
    bypassConfirmRef.current = true;
    event.currentTarget.requestSubmit();
  }

  return (
    <form action={formAction} onSubmit={handleSubmit}>
      <input ref={confirmedInputRef} type="hidden" name="confirmed" value="false" />
      <Button type="submit" variant="outline" size="sm" disabled={pending} className="text-destructive">
        <Trash2 className="size-4" />
        Limpar log operacional
      </Button>
    </form>
  );
}
