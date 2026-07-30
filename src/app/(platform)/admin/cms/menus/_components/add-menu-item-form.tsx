"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { addMenuItemAction, type MenuActionState } from "../actions";

const initialState: MenuActionState = { error: null };

export function AddMenuItemForm() {
  const [state, formAction, pending] = useActionState(addMenuItemAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Item adicionado ao menu." });

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-muted-foreground">Texto do link</label>
        <Input name="label" required className="mt-1" placeholder="ex: Contato" />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground">Link de destino</label>
        <Input name="href" required className="mt-1" placeholder="ex: /contato" />
        <p className="mt-1 text-xs text-muted-foreground/56">Para onde o visitante vai ao clicar nesse item do menu.</p>
      </div>

      <Button type="submit" disabled={pending}>
        Adicionar item
      </Button>
    </form>
  );
}
