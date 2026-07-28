"use client";

import { useActionState } from "react";
import { updateRegistrationApprovalAction, type SettingsActionState } from "../actions";

const initialState: SettingsActionState = { error: null };

export function RegistrationApprovalToggleForm({ enabled }: { enabled: boolean }) {
  const [state, formAction, pending] = useActionState(updateRegistrationApprovalAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" name="enabled" defaultChecked={enabled} className="h-4 w-4 rounded border-border" />
        Exigir aprovação manual para novos registros
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        Salvar
      </button>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
