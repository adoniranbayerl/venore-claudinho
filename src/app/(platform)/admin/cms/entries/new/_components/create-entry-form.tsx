"use client";

import { useActionState } from "react";
import { MediaPickerField } from "@/components/media-picker-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
        <label className="block text-xs font-medium text-muted-foreground">Título</label>
        <input name="title" required className="mt-1 w-full rounded border border-border px-2 py-1 text-sm" />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground">Slug</label>
        <input name="slug" required className="mt-1 w-full rounded border border-border px-2 py-1 text-sm" />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground">Content type</label>
        <Select name="contentTypeId" required>
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="selecione..." />
          </SelectTrigger>
          <SelectContent>
            {contentTypes.map((contentType) => (
              <SelectItem key={contentType.id} value={contentType.id}>
                {contentType.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground">Categoria (opcional)</label>
        <Select name="categoryId">
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="nenhuma" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground">Corpo</label>
        <textarea name="body" rows={8} className="mt-1 w-full rounded border border-border px-2 py-1 text-sm" />
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
