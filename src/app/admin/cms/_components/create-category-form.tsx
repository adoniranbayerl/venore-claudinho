"use client";

import { useActionState } from "react";
import { createCategoryAction, type CmsActionState } from "../actions";

const initialState: CmsActionState = { error: null };

export function CreateCategoryForm() {
  const [state, formAction, pending] = useActionState(createCategoryAction, initialState);

  return (
    <form action={formAction} className="mt-3 space-y-3">
      <div className="flex gap-3">
        <input
          name="key"
          placeholder="chave (kebab-case, ex: eventos)"
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
        Criar categoria
      </button>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
