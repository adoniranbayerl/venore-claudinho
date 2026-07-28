"use client";

import { useActionState } from "react";
import { publishEntryAction, type CmsActionState } from "../actions";

const initialState: CmsActionState = { error: null };

export function PublishEntryButton({ entryId }: { entryId: string }) {
  const [state, formAction, pending] = useActionState(publishEntryAction, initialState);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={entryId} />
      <button type="submit" disabled={pending} className="text-xs text-foreground hover:underline disabled:opacity-50">
        publicar
      </button>
      {state.error && <p className="text-xs text-destructive">{state.error}</p>}
    </form>
  );
}
