"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { activateThemeAction, type ThemesActionState } from "../actions";

const initialState: ThemesActionState = { error: null };

export function ActivateThemeButton({ themeKey }: { themeKey: string }) {
  const [state, formAction, pending] = useActionState(activateThemeAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Tema ativado." });

  return (
    <form action={formAction}>
      <input type="hidden" name="themeKey" value={themeKey} />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        Ativar
      </Button>
    </form>
  );
}
