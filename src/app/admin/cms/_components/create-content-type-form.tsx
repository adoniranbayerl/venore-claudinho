"use client";

import { useActionState } from "react";
import { createContentTypeAction, type CmsActionState } from "../actions";

const initialState: CmsActionState = { error: null };

export function CreateContentTypeForm() {
  const [state, formAction, pending] = useActionState(createContentTypeAction, initialState);

  return (
    <form action={formAction} className="mt-3 space-y-3">
      <div className="flex gap-3">
        <input
          name="key"
          placeholder="chave (kebab-case, ex: noticia)"
          required
          className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
        />
        <input
          name="name"
          placeholder="nome de exibição"
          required
          className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
        />
      </div>
      <input
        name="description"
        placeholder="descrição (opcional)"
        className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        Criar content type
      </button>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
