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
import { createContentTypeAction, type CmsActionState } from "../actions";

const initialState: CmsActionState = { error: null };

// Rótulo de exibição é "tag" (docs/implementation-roadmap.md — Fase 2/#2 decidiu o conceito,
// Fase 3 faz o rename de vocabulário na tela); rota/permission continuam "content-type(s)" por
// baixo — não são visíveis pro usuário final.
export function CreateContentTypeForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createContentTypeAction, initialState);
  const [name, setName] = useState("");
  useActionToast({ pending, error: state.error, successMessage: "Tag criada.", onSuccess: () => setOpen(false) });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus /> Nova tag
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova tag</DialogTitle>
          <DialogDescription>Um conteúdo pode ter mais de uma tag.</DialogDescription>
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
              placeholder="ex: Notícia"
            />
          </div>
          <AutoSlugField name="key" sourceValue={name} label="Identificador" />
          <Input name="description" placeholder="Descrição (opcional)" />

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              Criar tag
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
