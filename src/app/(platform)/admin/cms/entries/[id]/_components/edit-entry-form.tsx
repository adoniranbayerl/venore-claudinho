"use client";

import { useActionState } from "react";
import { MediaPickerField } from "@/components/media-picker-field";
import type { PickableMedia } from "@/components/media-picker-field.actions";
import { updateEntryAction, type EditEntryActionState } from "../actions";

const initialState: EditEntryActionState = { error: null };

export function EditEntryForm({
  entryId,
  title,
  slug,
  body,
  categoryId,
  media,
  categories,
}: {
  entryId: string;
  title: string;
  slug: string;
  body: string;
  categoryId: string | null;
  media: PickableMedia | null;
  categories: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(updateEntryAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={entryId} />

      <div>
        <label className="block text-xs font-medium text-text-secondary">Título</label>
        <input
          name="title"
          defaultValue={title}
          required
          className="mt-1 w-full rounded border border-border-subtle px-2 py-1 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-secondary">Slug</label>
        <input
          name="slug"
          defaultValue={slug}
          required
          className="mt-1 w-full rounded border border-border-subtle px-2 py-1 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-secondary">Categoria (opcional)</label>
        <select
          name="categoryId"
          defaultValue={categoryId ?? ""}
          className="mt-1 w-full rounded border border-border-subtle px-2 py-1 text-sm"
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
        <label className="block text-xs font-medium text-text-secondary">Corpo</label>
        <textarea
          name="body"
          rows={8}
          defaultValue={body}
          className="mt-1 w-full rounded border border-border-subtle px-2 py-1 text-sm"
        />
      </div>

      <MediaPickerField name="mediaId" initialMedia={media} />

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        Salvar
      </button>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
