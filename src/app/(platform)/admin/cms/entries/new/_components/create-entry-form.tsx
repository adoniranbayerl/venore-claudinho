"use client";

import { useActionState } from "react";
import { createEntryAction, type CreateEntryActionState } from "../actions";

const initialState: CreateEntryActionState = { error: null };

export function CreateEntryForm({
  contentTypes,
  categories,
}: {
  contentTypes: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createEntryAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700">Título</label>
        <input name="title" required className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm" />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700">Slug</label>
        <input name="slug" required className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm" />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700">Content type</label>
        <select name="contentTypeId" required className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm">
          <option value="">selecione...</option>
          {contentTypes.map((contentType) => (
            <option key={contentType.id} value={contentType.id}>
              {contentType.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700">Categoria (opcional)</label>
        <select name="categoryId" className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm">
          <option value="">nenhuma</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700">Corpo</label>
        <textarea name="body" rows={8} className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm" />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700">Media ID (opcional)</label>
        <input name="mediaId" className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm" />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        Criar entry
      </button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
