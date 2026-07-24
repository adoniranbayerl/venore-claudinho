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
        className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-900 disabled:opacity-50"
      >
        Publicar
      </button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
