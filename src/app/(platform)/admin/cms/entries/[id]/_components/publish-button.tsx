"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { publishEntryFromEditAction, type EditEntryActionState } from "../actions";

const initialState: EditEntryActionState = { error: null };

export function PublishButton({ entryId }: { entryId: string }) {
  const [state, formAction, pending] = useActionState(publishEntryFromEditAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Conteúdo publicado." });

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={entryId} />
      <Button type="submit" variant="outline" disabled={pending}>
        Publicar
      </Button>
    </form>
  );
}
