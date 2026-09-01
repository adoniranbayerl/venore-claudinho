import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { getCurrentUser } from "@/contexts/auth";
import { Badge } from "@/components/ui/badge";
import { isPluginActive } from "@/platform/plugin-engine/is-plugin-active";
import { getTicket, parseTicketReference } from "@/plugins/helpdesk";
import { TICKET_STATUS_BADGE_VARIANT, TICKET_STATUS_LABELS } from "@/plugins/helpdesk/shared/ticket-status-display";
import { canRequesterReopen } from "@/plugins/helpdesk/shared/ticket-state";
import { TicketTimeline } from "../../components/portal/ticket-timeline";
import { AddCommentForm } from "../../components/portal/add-comment-form";
import { RatingPrompt } from "../../components/portal/rating-prompt";

export const dynamic = "force-dynamic";

// Detalhe do chamado no portal do solicitante (§1, superfície 1) — timeline só com eventos
// `public` (o service filtra), com campo de resposta. `:ticketRef` = `{queue.key}-{seq}`.
export default async function HelpdeskPortalTicketPage({ params }: { params: Promise<{ ticketRef: string }> }) {
  if (!(await isPluginActive("helpdesk"))) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data) {
    redirect("/api/auth/signin");
  }

  const { ticketRef } = await params;
  const parsed = parseTicketReference(ticketRef);
  if (!parsed) {
    notFound();
  }

  const result = await getTicket({ queueKey: parsed.queueKey, seq: parsed.seq });
  if (!result.success) {
    if (result.error.code.endsWith("not_found")) notFound();
    return <p className="mx-auto max-w-3xl py-6 text-sm text-destructive">{result.error.message}</p>;
  }

  const detail = result.data;
  const { ticket } = detail;
  const openedAt = new Date(ticket.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-2">
      <Link href="/chamados" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Meus chamados
      </Link>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono">
            {detail.reference}
          </Badge>
          <Badge variant={TICKET_STATUS_BADGE_VARIANT[ticket.status]}>{TICKET_STATUS_LABELS[ticket.status]}</Badge>
          <span className="text-xs text-muted-foreground">
            {detail.queue.name}
            {detail.category ? ` · ${detail.category.label}` : ""}
          </span>
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{ticket.title}</h1>
        <p className="text-xs text-muted-foreground">Aberto em {openedAt}</p>
        {ticket.location && (
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5" />
            {ticket.location}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm whitespace-pre-wrap text-foreground">{ticket.description}</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Andamento</h2>
        <TicketTimeline entries={detail.timeline} authorNames={{}} currentUserId={currentUser.data.id} />
      </section>

      {ticket.status === "resolved" && (
        <RatingPrompt
          ticketId={ticket.id}
          reference={detail.reference}
          currentScore={ticket.ratingScore}
          canReopen={canRequesterReopen(ticket.status, ticket.resolvedAt)}
        />
      )}

      {ticket.status !== "closed" && ticket.status !== "cancelled" && (
        <section className="space-y-2 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">Responder</h2>
          <AddCommentForm ticketId={ticket.id} reference={detail.reference} />
        </section>
      )}
    </div>
  );
}
