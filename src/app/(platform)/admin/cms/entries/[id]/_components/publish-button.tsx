"use client";

import { useActionState } from "react";
import { publishEntryFromEditAction, type EditEntryActionState } from "../actions";

const initialState: EditEntryActionState = { error: null };

export function PublishButton({ entryId }: { entryId: string }) {
  const [state, formAction, pending] = useActionState(publishEntryFromEditAction, initialState);

  return (
    <form action={formAction} className="flex flex-col items-start gap-1">
      <input type="hidden" name="id" value={entryId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded border border-border-subtle px-3 py-1.5 text-sm font-medium text-text-primary disabled:opacity-50"
      >
        Publicar
      </button>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
