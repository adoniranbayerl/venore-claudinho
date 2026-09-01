"use client";

import { useActionState, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useActionToast } from "@/hooks/use-action-toast";
import type { QueueListItem } from "@/plugins/helpdesk";
import { createQueueAction, updateQueueAction, type HelpdeskActionState } from "./actions";
import { QueueFields } from "./queue-fields";

const initialState: HelpdeskActionState = { error: null };

export function CreateQueueDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createQueueAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Fila criada.", onSuccess: () => setOpen(false) });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Nova fila
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova fila</DialogTitle>
          <DialogDescription>Categorias e responsáveis são adicionados depois, dentro da fila.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <QueueFields />
          <Button type="submit" disabled={pending} className="w-full">
            Criar fila
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditQueueDialog({ queue }: { queue: QueueListItem }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(updateQueueAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Fila atualizada.", onSuccess: () => setOpen(false) });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="size-4" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar fila</DialogTitle>
          <DialogDescription>O identificador da fila (usado em links e no número do chamado) não muda.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="queueId" value={queue.id} />
          <QueueFields
            defaultName={queue.name}
            defaultDescription={queue.description ?? ""}
            defaultIcon={queue.icon ?? ""}
            defaultPriority={queue.defaultPriority}
          />
          <Button type="submit" disabled={pending} className="w-full">
            Salvar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
