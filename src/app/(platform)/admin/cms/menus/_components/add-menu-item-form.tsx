"use client";

import { useActionState } from "react";
import { addMenuItemAction, type MenuActionState } from "../actions";

const initialState: MenuActionState = { error: null };

export function AddMenuItemForm() {
  const [state, formAction, pending] = useActionState(addMenuItemAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700">Label</label>
        <input name="label" required className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm" />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700">Href</label>
        <input name="href" required className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm" />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        Adicionar item
      </button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
