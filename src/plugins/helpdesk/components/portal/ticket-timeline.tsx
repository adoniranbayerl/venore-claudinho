"use client";

import { CircleDot, MessageSquare, Paperclip, RefreshCw, Star, UserRoundCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TicketTimelineEntry } from "@/plugins/helpdesk";
import { TICKET_STATUS_LABELS_TEAM } from "@/plugins/helpdesk/shared/ticket-status-display";

// Timeline única do chamado (§2.2) — histórico + comentários no mesmo lugar. Componente de
// apresentação puro: recebe as entradas já filtradas por visibilidade pelo service (get-ticket),
// os nomes de autor resolvidos e o id do ator atual pra rotular "Você". Usado no portal e no
// drawer do admin.
type AuthorNames = Record<string, string>;

const KIND_ICON: Record<string, typeof CircleDot> = {
  created: CircleDot,
  comment: MessageSquare,
  status_change: RefreshCw,
  assignment: UserRoundCheck,
  rating: Star,
};

function entryHeadline(entry: TicketTimelineEntry): string | null {
  if (entry.kind === "created") return "abriu o chamado";
  if (entry.kind === "status_change") {
    const to = entry.meta?.to;
    return to ? `mudou o status para "${TICKET_STATUS_LABELS_TEAM[to as keyof typeof TICKET_STATUS_LABELS_TEAM] ?? to}"` : "mudou o status";
  }
  if (entry.kind === "assignment") {
    return entry.meta?.to ? "atribuiu o chamado" : "removeu a atribuição";
  }
  if (entry.kind === "rating") {
    const score = entry.meta?.score;
    return score ? `avaliou o atendimento (${score}/5)` : "avaliou o atendimento";
  }
  return null;
}

export function TicketTimeline({
  entries,
  authorNames,
  currentUserId,
}: {
  entries: TicketTimelineEntry[];
  authorNames: AuthorNames;
  currentUserId: string | null;
}) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">Sem movimentações ainda.</p>;
  }

  return (
    <ol className="space-y-4">
      {entries.map((entry) => {
        const Icon = KIND_ICON[entry.kind] ?? CircleDot;
        const isMine = currentUserId !== null && entry.authorUserId === currentUserId;
        const who = isMine
          ? "Você"
          : entry.authorUserId
            ? authorNames[entry.authorUserId] ?? "Equipe de atendimento"
            : entry.authorLabel ?? "Sistema";
        const headline = entryHeadline(entry);
        const when = new Date(entry.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

        return (
          <li key={entry.id} className="flex gap-3">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Icon className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{who}</span>
                {headline ? ` ${headline}` : entry.kind === "comment" ? " comentou" : ""}
                {" · "}
                {when}
                {entry.visibility === "internal" && (
                  <Badge variant="outline" className="ml-2">
                    Nota interna
                  </Badge>
                )}
              </p>
              {entry.body && <p className="text-sm whitespace-pre-wrap text-foreground">{entry.body}</p>}
              {entry.attachments.length > 0 && (
                <ul className="flex flex-wrap gap-2 pt-1">
                  {entry.attachments.map((attachment) => (
                    <li key={attachment.id}>
                      {attachment.mediaUrl && attachment.mediaContentType?.startsWith("image/") ? (
                        <a href={attachment.mediaUrl} target="_blank" rel="noreferrer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={attachment.mediaUrl}
                            alt={attachment.mediaFilename ?? "anexo"}
                            className="size-20 rounded-lg border border-border object-cover"
                          />
                        </a>
                      ) : (
                        <a
                          href={attachment.mediaUrl ?? "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-foreground hover:bg-muted"
                        >
                          <Paperclip className="size-3.5" />
                          {attachment.mediaFilename ?? "anexo"}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
