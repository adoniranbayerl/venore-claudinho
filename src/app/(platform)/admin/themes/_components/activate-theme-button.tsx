"use client";

import { useActionState } from "react";
import { activateThemeAction, type ThemesActionState } from "../actions";

const initialState: ThemesActionState = { error: null };

export function ActivateThemeButton({ themeKey, disabled }: { themeKey: string; disabled: boolean }) {
  const [state, formAction, pending] = useActionState(activateThemeAction, initialState);

  return (
    <form action={formAction} className="space-y-1">
      <input type="hidden" name="themeKey" value={themeKey} />
      <button
        type="submit"
        disabled={disabled || pending}
        className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {disabled ? "Ativo" : "Ativar"}
      </button>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
