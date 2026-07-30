"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { deleteMenuAction, type MenuActionState } from "../actions";

const initialState: MenuActionState = { error: null };

export function DeleteMenuButton({ menuId }: { menuId: string }) {
  const [state, formAction, pending] = useActionState(deleteMenuAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Menu removido." });

  return (
    <form action={formAction}>
      <input type="hidden" name="menuId" value={menuId} />
      <Button type="submit" variant="ghost" size="icon-sm" disabled={pending} aria-label="Remover menu">
        <Trash2 />
      </Button>
    </form>
  );
}
