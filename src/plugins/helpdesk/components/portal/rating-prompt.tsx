"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import { TICKET_RATING_MAX } from "@/plugins/helpdesk/contracts/types";
import { rateOwnTicketAction, reopenOwnTicketAction, type PortalActionState } from "../../routes/portal/actions";

const initialState: PortalActionState = { error: null };
const STARS = Array.from({ length: TICKET_RATING_MAX }, (_, index) => index + 1);

// Convite de avaliação do portal logado (docs/chamados-plugin.md §5) — aparece quando o chamado
// está `resolved`. Além de avaliar, o solicitante pode reabrir dentro da janela de N dias
// (`canReopen`, calculado no servidor). Reenviar a nota substitui a anterior.
export function RatingPrompt({
  ticketId,
  reference,
  currentScore,
  canReopen,
}: {
  ticketId: string;
  reference: string;
  currentScore: number | null;
  canReopen: boolean;
}) {
  const router = useRouter();
  const [score, setScore] = useState(currentScore ?? 0);
  const [rateState, rateAction, ratePending] = useActionState(rateOwnTicketAction, initialState);
  const [reopenState, reopenAction, reopenPending] = useActionState(reopenOwnTicketAction, initialState);

  useActionToast({
    pending: ratePending,
    error: rateState.error,
    successMessage: "Obrigado pela avaliação!",
    onSuccess: () => router.refresh(),
  });
  useActionToast({
    pending: reopenPending,
    error: reopenState.error,
    successMessage: "Chamado reaberto — a equipe foi avisada.",
    onSuccess: () => router.refresh(),
  });

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Como foi o atendimento?</h2>
        <form action={rateAction} className="mt-2 space-y-3">
          <input type="hidden" name="ticketId" value={ticketId} />
          <input type="hidden" name="reference" value={reference} />
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
          <Button type="submit" disabled={ratePending || score < 1}>
            {currentScore ? "Atualizar avaliação" : "Enviar avaliação"}
          </Button>
        </form>
      </div>

      {canReopen && (
        <div className="border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-foreground">Ainda com problema?</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Se o problema voltou ou não foi resolvido, você pode reabrir este chamado. Depois desse prazo, abra um novo.
          </p>
          <form action={reopenAction} className="mt-2 space-y-2">
            <input type="hidden" name="ticketId" value={ticketId} />
            <input type="hidden" name="reference" value={reference} />
            <Textarea name="note" rows={2} maxLength={2000} placeholder="O que ainda está acontecendo? (opcional)" />
            <Button type="submit" variant="outline" disabled={reopenPending}>
              <RotateCcw className="size-4" />
              Reabrir chamado
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
