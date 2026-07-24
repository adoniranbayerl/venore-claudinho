"use client";

import { useActionState } from "react";
import { updateEntryAction, type EditEntryActionState } from "../actions";

const initialState: EditEntryActionState = { error: null };

export function EditEntryForm({
  entryId,
  title,
  slug,
  body,
  categoryId,
  mediaId,
  categories,
}: {
  entryId: string;
  title: string;
  slug: string;
  body: string;
  categoryId: string | null;
  mediaId: string | null;
  categories: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(updateEntryAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={entryId} />

      <div>
        <label className="block text-xs font-medium text-gray-700">Título</label>
        <input
          name="title"
          defaultValue={title}
          required
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700">Slug</label>
        <input
          name="slug"
          defaultValue={slug}
          required
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700">Categoria (opcional)</label>
        <select
          name="categoryId"
          defaultValue={categoryId ?? ""}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
        >
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
        <textarea
          name="body"
          rows={8}
          defaultValue={body}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700">Media ID (opcional)</label>
        <input
          name="mediaId"
          defaultValue={mediaId ?? ""}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        Salvar
      </button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
