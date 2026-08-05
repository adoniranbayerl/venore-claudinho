"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useActionToast } from "@/hooks/use-action-toast";
import { deleteEntryAction, type CmsActionState } from "../actions";

const initialState: CmsActionState = { error: null };

// C6 (docs/implementation-roadmap.md, Fase 3): só chega aqui quando a entry já está arquivada —
// o botão só é renderizado por EntriesTable nesse status. Confirmação via Dialog (não
// window.confirm) pra ficar consistente com o resto do admin, já que exclusão aqui é definitiva
// (delete-entry, sem "lixeira").
export function DeleteEntryDialog({ entryId, title }: { entryId: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(deleteEntryAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Conteúdo excluído.", onSuccess: () => setOpen(false) });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="link" size="sm" className="h-auto p-0 text-xs text-destructive">
          <Trash2 className="size-3" /> Excluir
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir definitivamente?</DialogTitle>
          <DialogDescription>
            &ldquo;{title}&rdquo; será removido pra sempre — não existe lixeira nem desfazer.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction}>
          <input type="hidden" name="id" value={entryId} />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={pending}>
              Excluir definitivamente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
