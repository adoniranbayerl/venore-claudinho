"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { useActionToast } from "@/hooks/use-action-toast";
import type { TvBoardWithScreens } from "@/plugins/company-metrics";
import { createTvBoardAction, deleteTvBoardAction, type CompanyMetricsActionState } from "./actions";
import { CopyTvLinkButton } from "./copy-tv-link-button";
import { TvBoardEditor } from "./tv-board-editor";

const initialState: CompanyMetricsActionState = { error: null };

function CreateBoardForm() {
  const [state, formAction, pending] = useActionState(createTvBoardAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Painel criado." });

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-muted-foreground">
        Novo painel de TV
        <Input name="label" placeholder="ex.: Recepção · TV do comercial" required />
      </label>
      <Button type="submit" disabled={pending}>
        <Plus className="size-4" />
        Criar painel
      </Button>
    </form>
  );
}

function DeleteBoardButton({ boardId }: { boardId: string }) {
  const [state, formAction, pending] = useActionState(deleteTvBoardAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Painel removido." });
  return (
    <form action={formAction}>
      <input type="hidden" name="boardId" value={boardId} />
      <Button type="submit" variant="ghost" size="sm" disabled={pending} className="text-muted-foreground">
        Remover painel
      </Button>
    </form>
  );
}

export function ApresentacaoView({
  boards,
  sectors,
  targets,
}: {
  boards: TvBoardWithScreens[];
  sectors: { id: string; name: string }[];
  targets: { id: string; label: string; sectorName: string }[];
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-dashed border-border p-4">
        <CreateBoardForm />
        <p className="mt-2 text-xs text-muted-foreground/56">
          Cada painel tem um link próprio. Cole o link como item “webpage” numa playlist do Broadcast Studio, ou abra
          direto num navegador de TV.
        </p>
      </div>

      {boards.length === 0 ? (
        <EmptyState title="Nenhum painel de TV" description="Crie um painel e monte a rotação de telas." />
      ) : (
        <ul className="space-y-4">
          {boards.map(({ board, screens }) => (
            <li key={board.id} className="space-y-3 rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">{board.label}</h3>
                <div className="flex flex-wrap gap-1">
                  <CopyTvLinkButton token={board.token} />
                  <DeleteBoardButton boardId={board.id} />
                </div>
              </div>
              <TvBoardEditor
                boardId={board.id}
                sectors={sectors}
                targets={targets}
                initialScreens={screens.map((screen) => ({
                  kind: screen.kind,
                  sectorId: screen.sectorId,
                  targetId: screen.targetId,
                  dwellSeconds: screen.dwellSeconds,
                }))}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
