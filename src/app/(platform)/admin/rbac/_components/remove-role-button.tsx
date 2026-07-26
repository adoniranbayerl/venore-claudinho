"use client";

import { useActionState } from "react";
import { removeRoleAction, type RemoveRoleActionState } from "../actions";

const initialState: RemoveRoleActionState = { error: null };

export function RemoveRoleButton({ roleId, userId }: { roleId: string; userId: string }) {
  const [state, formAction, pending] = useActionState(removeRoleAction, initialState);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="roleId" value={roleId} />
      <input type="hidden" name="userId" value={userId} />
      <button type="submit" disabled={pending} className="text-xs text-destructive hover:underline disabled:opacity-50">
        remover
      </button>
      {state.error && <p className="text-xs text-destructive">{state.error}</p>}
    </form>
  );
}
