"use client";

import { useActionState } from "react";
import { uploadMediaAction, type MediaActionState } from "../actions";

const initialState: MediaActionState = { error: null };

export function UploadMediaForm() {
  const [state, formAction, pending] = useActionState(uploadMediaAction, initialState);

  return (
    <form action={formAction} className="flex items-center gap-3">
      <input
        type="file"
        name="file"
        required
        className="text-sm text-muted-foreground file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {pending ? "Enviando..." : "Enviar"}
      </button>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
