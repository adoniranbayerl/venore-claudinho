"use client";

import { useActionState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import { MAX_TICKET_ATTACHMENTS_PER_SCOPE } from "@/plugins/helpdesk/contracts/types";
import { addTicketCommentAction, type PortalActionState } from "../../routes/portal/actions";

const initialState: PortalActionState = { error: null };

export function AddCommentForm({ ticketId, reference }: { ticketId: string; reference: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(addTicketCommentAction, initialState);

  useActionToast({
    pending,
    error: state.error,
    successMessage: "Comentário enviado.",
    onSuccess: () => {
      formRef.current?.reset();
      router.refresh();
    },
  });

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <input type="hidden" name="ticketId" value={ticketId} />
      <input type="hidden" name="reference" value={reference} />
      <Textarea name="body" required rows={3} placeholder="Responder à equipe, adicionar informação..." />
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Fotos (até {MAX_TICKET_ATTACHMENTS_PER_SCOPE}, opcional)
        <input
          type="file"
          name="photos"
          accept="image/*,application/pdf"
          multiple
          className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:text-foreground"
        />
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Enviando..." : "Enviar"}
      </Button>
    </form>
  );
}
