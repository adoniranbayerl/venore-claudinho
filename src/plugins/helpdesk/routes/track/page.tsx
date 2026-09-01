import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
import { getTicketByTrackingToken } from "@/plugins/helpdesk";
import { TICKET_STATUS_BADGE_VARIANT, TICKET_STATUS_LABELS } from "@/plugins/helpdesk/shared/ticket-status-display";
import { TicketTimeline } from "../../components/portal/ticket-timeline";
import { TrackCommentForm } from "../../components/portal/track-comment-form";
import { TrackRatingForm } from "../../components/portal/track-rating-form";

export const dynamic = "force-dynamic";

// Acompanhamento anônimo por tracking token (§1 superfície 2, §2.5) — o solicitante do quiosque
// abre este link (que recebeu ao enviar o chamado), vê a timeline pública, comenta e, quando
// resolvido, avalia. Sem sessão: passa pela shell do (platform) mas nada aqui exige login.
export default async function HelpdeskTrackPage({ params }: { params: Promise<{ trackingToken: string }> }) {
  if (!(await isPluginActive("helpdesk"))) {
    notFound();
  }

  const { trackingToken } = await params;
  const result = await getTicketByTrackingToken(trackingToken);
  if (!result.success) {
    if (result.error.code.endsWith("not_found")) notFound();
    return <p className="mx-auto max-w-3xl py-6 text-sm text-destructive">{result.error.message}</p>;
  }

  const view = result.data;
  const openedAt = new Date(view.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  const isClosed = view.status === "closed" || view.status === "cancelled";

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-2">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono">
            {view.reference}
          </Badge>
          <Badge variant={TICKET_STATUS_BADGE_VARIANT[view.status]}>{TICKET_STATUS_LABELS[view.status]}</Badge>
          <span className="text-xs text-muted-foreground">
            {view.queueName}
            {view.categoryLabel ? ` · ${view.categoryLabel}` : ""}
          </span>
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{view.title}</h1>
        <p className="text-xs text-muted-foreground">
          Aberto em {openedAt}
          {view.requesterName ? ` · por ${view.requesterName}` : ""}
        </p>
        {view.location && (
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5" />
            {view.location}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm whitespace-pre-wrap text-foreground">{view.description}</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Andamento</h2>
        <TicketTimeline entries={view.timeline} authorNames={{}} currentUserId={null} />
      </section>

      {view.canRate && (
        <section className="space-y-2 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">Como foi o atendimento?</h2>
          <TrackRatingForm trackingToken={trackingToken} currentScore={view.ratingScore} />
        </section>
      )}

      {!isClosed && (
        <section className="space-y-2 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">Responder</h2>
          <p className="text-xs text-muted-foreground">
            Adicione informação ou tire uma dúvida. A equipe recebe sua resposta na hora.
          </p>
          <TrackCommentForm trackingToken={trackingToken} />
        </section>
      )}

      <p className="text-xs text-muted-foreground">
        Guarde este link para acompanhar o chamado depois — ele é o seu acesso sem precisar de conta.
      </p>
    </div>
  );
}
