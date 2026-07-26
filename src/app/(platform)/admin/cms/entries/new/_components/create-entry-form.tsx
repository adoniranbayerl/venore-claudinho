"use client";

import { useActionState } from "react";
import { MediaPickerField } from "@/components/media-picker-field";
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
        <label className="block text-xs font-medium text-text-secondary">Título</label>
        <input name="title" required className="mt-1 w-full rounded border border-border-subtle px-2 py-1 text-sm" />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-secondary">Slug</label>
        <input name="slug" required className="mt-1 w-full rounded border border-border-subtle px-2 py-1 text-sm" />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-secondary">Content type</label>
        <select name="contentTypeId" required className="mt-1 w-full rounded border border-border-subtle px-2 py-1 text-sm">
          <option value="">selecione...</option>
          {contentTypes.map((contentType) => (
            <option key={contentType.id} value={contentType.id}>
              {contentType.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-text-secondary">Categoria (opcional)</label>
        <select name="categoryId" className="mt-1 w-full rounded border border-border-subtle px-2 py-1 text-sm">
          <option value="">nenhuma</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-text-secondary">Corpo</label>
        <textarea name="body" rows={8} className="mt-1 w-full rounded border border-border-subtle px-2 py-1 text-sm" />
      </div>

      <MediaPickerField name="mediaId" />

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        Criar entry
      </button>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
