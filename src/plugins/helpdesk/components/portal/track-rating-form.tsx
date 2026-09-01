"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import { TICKET_RATING_MAX } from "@/plugins/helpdesk/contracts/types";
import { rateTicketAction, type TrackActionState } from "../../routes/track/actions";

const initialState: TrackActionState = { error: null };
const STARS = Array.from({ length: TICKET_RATING_MAX }, (_, index) => index + 1);

// Convite de avaliação na página de acompanhamento anônima (§2.5) — só aparece quando o chamado
// está resolvido/fechado. Reenviar substitui a nota anterior (o service grava um novo evento
// `rating` e a leitura pega o último).
export function TrackRatingForm({
  trackingToken,
  currentScore,
}: {
  trackingToken: string;
  currentScore: number | null;
}) {
  const router = useRouter();
  const [score, setScore] = useState(currentScore ?? 0);
  const [state, formAction, pending] = useActionState(rateTicketAction, initialState);

  useActionToast({
    pending,
    error: state.error,
    successMessage: "Obrigado pela avaliação!",
    onSuccess: () => router.refresh(),
  });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="trackingToken" value={trackingToken} />
      <input type="hidden" name="score" value={score} />
      <div className="flex items-center gap-1">
        {STARS.map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`${value} de ${TICKET_RATING_MAX}`}
            aria-pressed={score >= value}
            onClick={() => setScore(value)}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-warning"
          >
            <Star className={`size-6 ${score >= value ? "fill-current text-warning" : ""}`} />
          </button>
        ))}
      </div>
      <label className="flex flex-col gap-1 text-xs text-muted-foreground">
        Comentário (opcional)
        <Textarea name="comment" rows={2} maxLength={2000} placeholder="O que achou do atendimento?" />
      </label>
      <Button type="submit" disabled={pending || score < 1}>
        {currentScore ? "Atualizar avaliação" : "Enviar avaliação"}
      </Button>
    </form>
  );
}
