"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { activateColorPaletteAction, type ThemesActionState } from "../actions";

const initialState: ThemesActionState = { error: null };

export function ActivateColorPaletteButton({ paletteId }: { paletteId: string }) {
  const [state, formAction, pending] = useActionState(activateColorPaletteAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Paleta ativada." });

  return (
    <form action={formAction}>
      <input type="hidden" name="paletteId" value={paletteId} />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        Usar
      </Button>
    </form>
  );
}
