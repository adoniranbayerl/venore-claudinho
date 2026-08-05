"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { AutoSlugField } from "@/components/auto-slug-field";
import { useActionToast } from "@/hooks/use-action-toast";
import { createCategoryAction, type CmsActionState } from "../actions";

const initialState: CmsActionState = { error: null };

export function CreateCategoryForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createCategoryAction, initialState);
  const [name, setName] = useState("");
  useActionToast({ pending, error: state.error, successMessage: "Categoria criada.", onSuccess: () => setOpen(false) });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus /> Nova categoria
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova categoria</DialogTitle>
          <DialogDescription>Agrupa conteúdos relacionados sob um mesmo endereço de página.</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground">Nome de exibição</label>
            <Input
              name="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1"
              placeholder="ex: Eventos"
            />
          </div>
          <AutoSlugField name="key" sourceValue={name} label="Identificador" />
          <AutoSlugField name="slug" sourceValue={name} label="Endereço da página" />
          <Input name="description" placeholder="Descrição (opcional)" />

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              Criar categoria
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
