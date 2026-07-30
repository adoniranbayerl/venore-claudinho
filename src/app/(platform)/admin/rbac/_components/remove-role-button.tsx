"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { removeRoleAction, type RemoveRoleActionState } from "../actions";

const initialState: RemoveRoleActionState = { error: null };

export function RemoveRoleButton({ roleId, userId }: { roleId: string; userId: string }) {
  const [state, formAction, pending] = useActionState(removeRoleAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Papel removido." });

  return (
    <form action={formAction}>
      <input type="hidden" name="roleId" value={roleId} />
      <input type="hidden" name="userId" value={userId} />
      <Button type="submit" variant="link" size="sm" disabled={pending} className="h-auto p-0 text-xs text-destructive">
        Remover
      </Button>
    </form>
  );
}
