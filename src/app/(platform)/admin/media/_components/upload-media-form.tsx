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
        className="text-sm text-gray-700 file:mr-3 file:rounded file:border-0 file:bg-gray-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Enviando..." : "Enviar"}
      </button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
