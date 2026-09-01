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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import type { CategoryRecord } from "@/plugins/helpdesk/contracts/types";
import { createCategoryAction, updateCategoryAction, type HelpdeskActionState } from "./actions";

const initialState: HelpdeskActionState = { error: null };

export function CreateCategoryDialog({ queueId, queueName }: { queueId: string; queueName: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createCategoryAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Categoria criada.", onSuccess: () => setOpen(false) });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="size-4" />
          Nova categoria
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova categoria em {queueName}</DialogTitle>
          <DialogDescription>Serve para triagem e relatório dos chamados dessa fila.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="queueId" value={queueId} />
          <label className="flex flex-col gap-1 text-sm text-muted-foreground">
            Nome
            <Input name="label" placeholder="ex.: Impressora" required maxLength={60} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-muted-foreground">
            Descrição (opcional)
            <Textarea name="description" rows={2} placeholder="Quando usar esta categoria" />
          </label>
          <Button type="submit" disabled={pending} className="w-full">
            Criar categoria
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditCategoryDialog({ category }: { category: CategoryRecord }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(updateCategoryAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Categoria atualizada.", onSuccess: () => setOpen(false) });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Editar categoria">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar categoria</DialogTitle>
          <DialogDescription>O identificador interno da categoria não muda.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="categoryId" value={category.id} />
          <label className="flex flex-col gap-1 text-sm text-muted-foreground">
            Nome
            <Input name="label" defaultValue={category.label} required maxLength={60} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-muted-foreground">
            Descrição (opcional)
            <Textarea name="description" defaultValue={category.description ?? ""} rows={2} />
          </label>
          <Button type="submit" disabled={pending} className="w-full">
            Salvar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
