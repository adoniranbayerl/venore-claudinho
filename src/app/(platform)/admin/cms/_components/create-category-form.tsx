"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AutoSlugField } from "@/components/auto-slug-field";
import { useActionToast } from "@/hooks/use-action-toast";
import { createCategoryAction, type CmsActionState } from "../actions";

const initialState: CmsActionState = { error: null };

export function CreateCategoryForm() {
  const [state, formAction, pending] = useActionState(createCategoryAction, initialState);
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  useActionToast({ pending, error: state.error, successMessage: "Categoria criada.", onSuccess: () => setOpen(false) });

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setOpen(true)}>
        Nova categoria
      </Button>
    );
  }

  return (
    <form action={formAction} className="mt-3 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
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
        <div className="flex-1">
          <AutoSlugField name="key" sourceValue={name} label="Identificador" />
        </div>
      </div>
      <AutoSlugField name="slug" sourceValue={name} label="Endereço da página" />
      <Input name="description" placeholder="Descrição (opcional)" />
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          Criar categoria
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
