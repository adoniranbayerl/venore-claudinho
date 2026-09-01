"use client";

import { useActionState, useRef, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import type { BoardListItem } from "@/plugins/helpdesk";
import {
  createBoardAction,
  deleteBoardAction,
  updateBoardAction,
  type HelpdeskBoardActionState,
} from "./board-actions";

const initialState: HelpdeskBoardActionState = { error: null };

type QueueOption = { id: string; name: string };

// Campos do formulário do painel, reusados nos diálogos de criar e editar. `queueId` vazio =
// "Todas as filas" (§2.6). Layout/intervalo/exibir responsável são escolhas guiadas — sem JSON
// nem UUID cru na tela (feedback "Admin UX: no dev jargon").
function BoardFormFields({ board, queueOptions }: { board?: BoardListItem; queueOptions: QueueOption[] }) {
  return (
    <>
      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Nome do painel
        <Input name="label" placeholder="ex.: TV da Manutenção" defaultValue={board?.label} required maxLength={80} />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Fila
        <select
          name="queueId"
          defaultValue={board?.queueId ?? ""}
          className="h-10 rounded-md border border-input bg-transparent px-3 text-sm text-foreground"
        >
          <option value="">Todas as filas</option>
          {queueOptions.map((queue) => (
            <option key={queue.id} value={queue.id}>
              {queue.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Layout
        <select
          name="layout"
          defaultValue={board?.layout ?? "kanban"}
          className="h-10 rounded-md border border-input bg-transparent px-3 text-sm text-foreground"
        >
          <option value="kanban">Kanban — colunas por status</option>
          <option value="open_list">Lista de pendentes — por prioridade</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted-foreground">
        Atualizar a cada (segundos)
        <Input
          name="refreshSeconds"
          type="number"
          min={5}
          max={600}
          step={5}
          defaultValue={board?.refreshSeconds ?? 20}
          required
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          name="showAssignee"
          value="true"
          defaultChecked={board?.showAssignee ?? true}
          className="size-4"
        />
        Mostrar o responsável no card
      </label>
    </>
  );
}

export function CreateBoardDialog({ queueOptions }: { queueOptions: QueueOption[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createBoardAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Painel criado.", onSuccess: () => setOpen(false) });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="size-4" />
          Novo painel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo painel</DialogTitle>
          <DialogDescription>
            Uma tela de parede (kanban ou lista) que atualiza sozinha. Gera um link próprio para abrir na TV.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <BoardFormFields queueOptions={queueOptions} />
          <Button type="submit" disabled={pending} className="w-full">
            Criar painel
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditBoardDialog({ board, queueOptions }: { board: BoardListItem; queueOptions: QueueOption[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(updateBoardAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Painel atualizado.", onSuccess: () => setOpen(false) });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Editar painel">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar painel</DialogTitle>
          <DialogDescription>O link do painel não muda — a TV continua apontada para o mesmo endereço.</DialogDescription>
        </DialogHeader>
        <form key={`${board.id}-${board.updatedAt.valueOf()}`} action={formAction} className="space-y-3">
          <input type="hidden" name="boardId" value={board.id} />
          <BoardFormFields board={board} queueOptions={queueOptions} />
          <Button type="submit" disabled={pending} className="w-full">
            Salvar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteBoardButton({ board }: { board: BoardListItem }) {
  const [state, formAction, pending] = useActionState(deleteBoardAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Painel removido." });
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <form ref={formRef} action={formAction} className="hidden">
        <input type="hidden" name="boardId" value={board.id} />
      </form>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Remover painel"
        disabled={pending}
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-4" />
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover “{board.label}”?</AlertDialogTitle>
            <AlertDialogDescription>
              O link do painel deixa de funcionar. Os chamados não são afetados. Não dá para desfazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={() => {
                setOpen(false);
                formRef.current?.requestSubmit();
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
