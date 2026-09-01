"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import { reopenTrackedTicketAction, type TrackActionState } from "../../routes/track/actions";

const initialState: TrackActionState = { error: null };

// Reabertura pelo link de acompanhamento anônimo (§5) — só renderizada quando `canReopen` (chamado
// resolvido e dentro da janela de N dias). O `tracking_token` autoriza; o use case aplica throttle.
export function TrackReopenForm({ trackingToken }: { trackingToken: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(reopenTrackedTicketAction, initialState);

  useActionToast({
    pending,
    error: state.error,
    successMessage: "Chamado reaberto — a equipe foi avisada.",
    onSuccess: () => router.refresh(),
  });

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="trackingToken" value={trackingToken} />
      <Textarea name="note" rows={2} maxLength={2000} placeholder="O que ainda está acontecendo? (opcional)" />
      <Button type="submit" variant="outline" disabled={pending}>
        <RotateCcw className="size-4" />
        Reabrir chamado
      </Button>
    </form>
  );
}
