"use client";

import { useActionState, useState } from "react";
import { FolderTree, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useActionToast } from "@/hooks/use-action-toast";
import type { SectorGroupRecord } from "@/plugins/company-metrics/contracts/types";
import {
  createSectorGroupAction,
  deleteSectorGroupAction,
  updateSectorGroupAction,
  type CompanyMetricsActionState,
} from "./actions";

const initialState: CompanyMetricsActionState = { error: null };

function AddGroupForm({ sectorId }: { sectorId: string }) {
  const [state, formAction, pending] = useActionState(createSectorGroupAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Grupo criado." });

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-border p-3">
      <input type="hidden" name="sectorId" value={sectorId} />
      <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-muted-foreground">
        Novo grupo
        <Input name="label" placeholder="ex.: Colégio Erasto Gaertner" required />
      </label>
      <Button type="submit" variant="secondary" disabled={pending}>
        <Plus className="size-4" />
        Adicionar
      </Button>
    </form>
  );
}

function GroupRow({ group }: { group: SectorGroupRecord }) {
  const [renameState, renameAction, renamePending] = useActionState(updateSectorGroupAction, initialState);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteSectorGroupAction, initialState);
  useActionToast({ pending: renamePending, error: renameState.error, successMessage: "Grupo atualizado." });
  useActionToast({ pending: deletePending, error: deleteState.error, successMessage: "Grupo removido." });

  return (
    <li className="flex flex-wrap items-center gap-2 px-3 py-2">
      <form action={renameAction} className="flex min-w-0 flex-1 items-center gap-2">
        <input type="hidden" name="groupId" value={group.id} />
        <Input name="label" defaultValue={group.label} className="h-8" required />
        <Button type="submit" variant="outline" size="sm" disabled={renamePending}>
          Salvar
        </Button>
      </form>
      <form action={deleteAction}>
        <input type="hidden" name="groupId" value={group.id} />
        <Button type="submit" variant="ghost" size="icon" disabled={deletePending} aria-label="Remover grupo">
          <Trash2 className="size-4" />
        </Button>
      </form>
    </li>
  );
}

export function SectorGroupsDialog({
  sectorId,
  sectorName,
  groups,
}: {
  sectorId: string;
  sectorName: string;
  groups: SectorGroupRecord[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FolderTree className="size-4" />
          Grupos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Grupos de {sectorName}</DialogTitle>
          <DialogDescription>
            Agrupamento opcional dentro do setor — instituição, regional, filial. As métricas e metas apontam para um
            grupo (ou para nenhum).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <ul className="divide-y divide-border rounded-lg border border-border">
            {groups.length === 0 && (
              <li className="px-3 py-4 text-sm text-muted-foreground">Nenhum grupo neste setor.</li>
            )}
            {groups.map((group) => (
              <GroupRow key={group.id} group={group} />
            ))}
          </ul>
          <AddGroupForm sectorId={sectorId} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
