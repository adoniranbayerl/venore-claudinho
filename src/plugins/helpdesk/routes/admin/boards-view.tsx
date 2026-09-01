import { headers } from "next/headers";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import type { BoardListItem } from "@/plugins/helpdesk";
import { CreateBoardDialog, DeleteBoardButton, EditBoardDialog } from "./board-dialogs";

type QueueOption = { id: string; name: string };

async function resolveOrigin(): Promise<string> {
  const store = await headers();
  const host = store.get("x-forwarded-host") ?? store.get("host") ?? "localhost:3000";
  const proto = store.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

const LAYOUT_LABEL: Record<BoardListItem["layout"], string> = {
  kanban: "Kanban",
  open_list: "Lista de pendentes",
};

// Aba Painéis do admin (§2.6) — só `helpdesk.manage`. Cada painel é uma tela de parede com seu
// próprio link (`/chamados/painel/<token>`) para abrir na TV ou pôr numa playlist do Broadcast.
export async function BoardsView({
  boards,
  queueOptions,
}: {
  boards: BoardListItem[];
  queueOptions: QueueOption[];
}) {
  const origin = await resolveOrigin();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Telas de acompanhamento que atualizam sozinhas. Uma por TV — cada uma com seu link.
        </p>
        <CreateBoardDialog queueOptions={queueOptions} />
      </div>

      {boards.length === 0 ? (
        <EmptyState
          title="Nenhum painel"
          description="Crie um painel para ter um kanban ou uma lista de chamados numa tela de parede."
        />
      ) : (
        <ul className="space-y-3">
          {boards.map((board) => {
            const url = `${origin}/chamados/painel/${board.token}`;
            return (
              <li
                key={board.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{board.label}</span>
                    <Badge variant="secondary">{board.queueName ?? "Todas as filas"}</Badge>
                    <Badge variant="outline">{LAYOUT_LABEL[board.layout]}</Badge>
                    <span className="text-xs text-muted-foreground">
                      atualiza a cada {board.refreshSeconds}s
                      {board.showAssignee ? " · com responsável" : " · sem responsável"}
                    </span>
                  </div>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 break-all text-xs text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="size-3.5 shrink-0" />
                    {url}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <EditBoardDialog board={board} queueOptions={queueOptions} />
                  <DeleteBoardButton board={board} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
