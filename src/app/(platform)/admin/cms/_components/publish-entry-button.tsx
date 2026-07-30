"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { publishEntryAction, type CmsActionState } from "../actions";

const initialState: CmsActionState = { error: null };

export function PublishEntryButton({ entryId }: { entryId: string }) {
  const [state, formAction, pending] = useActionState(publishEntryAction, initialState);
  useActionToast({ pending, error: state.error, successMessage: "Conteúdo publicado." });

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={entryId} />
      <Button type="submit" variant="link" size="sm" disabled={pending} className="h-auto p-0 text-xs">
        Publicar
      </Button>
    </form>
  );
}
