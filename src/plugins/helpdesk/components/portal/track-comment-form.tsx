"use client";

import { useActionState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import { submitTrackingCommentAction, type TrackActionState } from "../../routes/track/actions";

const initialState: TrackActionState = { error: null };

// Comentário do solicitante anônimo pelo link de acompanhamento (§2.5). Sem upload de foto: o
// anexo anônimo ficou para a Fase 8 (ver docs/chamados-plugin.md §8).
export function TrackCommentForm({ trackingToken }: { trackingToken: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(submitTrackingCommentAction, initialState);

  useActionToast({
    pending,
    error: state.error,
    successMessage: "Resposta enviada.",
    onSuccess: () => {
      formRef.current?.reset();
      router.refresh();
    },
  });

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <input type="hidden" name="trackingToken" value={trackingToken} />
      <Textarea name="body" required rows={3} maxLength={3000} placeholder="Escreva para a equipe de atendimento..." />
      <Button type="submit" disabled={pending}>
        {pending ? "Enviando..." : "Enviar"}
      </Button>
    </form>
  );
}
